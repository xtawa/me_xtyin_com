import { Client } from '@notionhq/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to convert Notion rich_text array to HTML
const notionRichTextToHtml = (richText: any[]) => {
  if (!Array.isArray(richText)) return '';
  
  return richText.map((chunk) => {
    // Basic safety escaping for the content text
    let text = chunk.plain_text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const { bold, italic, underline, strikethrough, code, color } = chunk.annotations;

    if (bold) text = `<strong>${text}</strong>`;
    if (italic) text = `<em>${text}</em>`;
    if (underline) text = `<u>${text}</u>`;
    if (strikethrough) text = `<s>${text}</s>`;
    if (code) text = `<code style="background:rgba(255,255,255,0.15); padding: 0.1em 0.3em; border-radius: 3px; font-family: monospace;">${text}</code>`;

    if (chunk.href) {
      text = `<a href="${chunk.href}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; text-underline-offset: 4px;">${text}</a>`;
    }

    return text;
  }).join('');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const notionToken = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  // Disable caching completely to ensure immediate updates from Notion
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!notionToken || !databaseId) {
    console.error("Missing Notion Environment Variables");
    return res.status(500).json({ 
      error: 'Misconfigured server environment. Missing Notion secrets.' 
    });
  }

  const notion = new Client({ auth: notionToken });

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const configData: Record<string, string> = {};
    const projects: any[] = [];
    const talks: any[] = [];

    response.results.forEach((page: any) => {
      const props = page.properties;
      const propKeys = Object.keys(props);

      // --- Column Detection ---
      
      // 1. Identify "Tags" column for filtering projects/talks
      const tagColName = propKeys.find(k => /^(tags|tag)$/i.test(k));
      
      // 2. Identify "Link" or "URL" column for project links
      const linkColName = propKeys.find(k => /^(link|url|href|website)$/i.test(k));

      // 3. Identify Key/Title column (Name)
      const keyColName = propKeys.find(k => /^(title|key|name)$/i.test(k));
      
      // 4. Identify Value/Description column
      const valColName = propKeys.find(k => /^(value|text|content|description|desc)$/i.test(k));

      // 5. Identify Icon column
      const iconColName = propKeys.find(k => /^(icon|image|img)$/i.test(k));

      // 6. Identify Date column
      const dateColName = propKeys.find(k => /^(date|time|when|day)$/i.test(k));

      if (!keyColName) return; // Skip if no primary key column

      const keyProp = props[keyColName];
      const valProp = valColName ? props[valColName] : null;
      const tagProp = tagColName ? props[tagColName] : null;
      const linkProp = linkColName ? props[linkColName] : null;
      const iconProp = iconColName ? props[iconColName] : null;
      const dateProp = dateColName ? props[dateColName] : null;

      // --- Check Row Type ---
      let isProject = false;
      let isTalk = false;

      if (tagProp) {
        let tagValues: string[] = [];
        if (tagProp.type === 'multi_select') {
          tagValues = tagProp.multi_select.map((t: any) => t.name.toLowerCase());
        } else if (tagProp.type === 'select' && tagProp.select) {
          tagValues = [tagProp.select.name.toLowerCase()];
        }

        if (tagValues.includes('projects')) isProject = true;
        if (tagValues.includes('talks')) isTalk = true;
      }

      // Extract Title (Common for all)
      let title = '';
      if (keyProp.type === 'title') {
        title = keyProp.title?.[0]?.plain_text || '';
      } else if (keyProp.type === 'rich_text') {
        title = keyProp.rich_text?.map((t: any) => t.plain_text).join('');
      }

      if (!title) return;

      if (isProject || isTalk) {
        // --- Process List Item (Project or Talk) ---
        let description = '';
        if (valProp) {
             if (valProp.type === 'rich_text') {
                 // Use HTML converter for descriptions to support rich text and links
                 description = notionRichTextToHtml(valProp.rich_text);
             } else if (valProp.type === 'url') {
                 description = valProp.url || '';
             }
        }

        let link = '';
        if (linkProp) {
            if (linkProp.type === 'url') link = linkProp.url || '';
            else if (linkProp.type === 'rich_text') link = linkProp.rich_text?.[0]?.plain_text || '';
        }
        link = link.trim();

        // Extract Date (Mostly for Talks)
        let date = '';
        if (dateProp) {
            if (dateProp.type === 'date') {
                date = dateProp.date?.start || '';
            } else if (dateProp.type === 'rich_text') {
                date = dateProp.rich_text?.map((t: any) => t.plain_text).join('');
            }
        }

        // Extract Icon from Column
        let iconValue = '';
        if (iconProp) {
            if (iconProp.type === 'rich_text') {
                iconValue = iconProp.rich_text?.map((t: any) => t.plain_text).join('');
            } else if (iconProp.type === 'url') {
                iconValue = iconProp.url || '';
            } else if (iconProp.type === 'files') {
                iconValue = iconProp.files?.[0]?.file?.url || iconProp.files?.[0]?.external?.url || '';
            }
        }

        let icon: { type: 'emoji' | 'image', value: string } | null = null;
        
        if (iconValue) {
            const trimmed = iconValue.trim();
            if (trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
                icon = { type: 'image', value: trimmed };
            } else {
                icon = { type: 'emoji', value: trimmed };
            }
        } else if (page.icon) {
            // Fallback to Page Icon if column is empty
            if (page.icon.type === 'emoji') {
                icon = { type: 'emoji', value: page.icon.emoji };
            } else if (page.icon.type === 'file') {
                icon = { type: 'image', value: page.icon.file.url };
            } else if (page.icon.type === 'external') {
                icon = { type: 'image', value: page.icon.external.url };
            }
        }

        const item = {
            text: title,
            description,
            href: link,
            icon,
            date
        };

        if (isProject) projects.push(item);
        if (isTalk) talks.push(item);

      } else {
        // --- Process Config Row ---
        if (!valProp) return; // Config rows must have values

        let value = '';

        // Special handling for photosFile (Plain Text)
        if (title.toLowerCase() === 'photosfile' && valProp.type === 'rich_text') {
            value = valProp.rich_text?.map((t: any) => t.plain_text).join('');
        } else {
            // General Handling
            switch (valProp.type) {
                case 'rich_text':
                value = notionRichTextToHtml(valProp.rich_text);
                break;
                case 'url':
                value = valProp.url || '';
                break;
                case 'email':
                value = valProp.email || '';
                break;
                case 'phone_number':
                value = valProp.phone_number || '';
                break;
                case 'number':
                value = String(valProp.number || '');
                break;
                case 'title':
                value = valProp.title?.map((t: any) => t.plain_text).join('');
                break;
            }
        }

        if (value) {
            configData[title] = value;
        }
      }
    });

    // Merge projects into the response
    const responseData = {
        ...configData,
        projects,
        talks
    };

    console.log("Fetched Notion Keys:", Object.keys(configData));
    console.log(`Fetched ${projects.length} Projects, ${talks.length} Talks`);
    
    return res.status(200).json(responseData);

  } catch (error: any) {
    console.error('Notion API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch data from Notion', details: error.message });
  }
}