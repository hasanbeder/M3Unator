const HTML_ENTITY_MAP = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#x27;': "'",
    '&#x2F;': '/'
};

function decodeHtmlEntities(value) {
    return value.replace(/&(amp|lt|gt|quot|#039|#x27|#x2F);/g, match => HTML_ENTITY_MAP[match] || match);
}

function stripHtmlTags(value) {
    return decodeHtmlEntities(
        value
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    );
}

function createTextNode(textContent) {
    return { textContent };
}

function createAnchor(href, textContent) {
    return {
        textContent,
        getAttribute(name) {
            return name === 'href' ? href : null;
        }
    };
}

function extractAnchors(html) {
    const anchorRegex = /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
    const anchors = [];

    for (const match of html.matchAll(anchorRegex)) {
        anchors.push(createAnchor(match[1] || match[2] || match[3] || '', stripHtmlTags(match[4] || '')));
    }

    return anchors;
}

function extractTitle(html) {
    const match = html.match(/<title>([\s\S]*?)<\/title>/i);
    return stripHtmlTags(match ? match[1] : '');
}

function extractScopedAnchors(html, selector) {
    const selectors = {
        'pre a[href]': /<pre\b[^>]*>[\s\S]*?<\/pre>/gi,
        '#table-content a[href]': /<table\b[^>]+id=["']table-content["'][^>]*>[\s\S]*?<\/table>/gi,
        'table.listing a[href]': /<table\b[^>]+class=["'][^"']*\blisting\b[^"']*["'][^>]*>[\s\S]*?<\/table>/gi,
        'table#listing a[href]': /<table\b[^>]+id=["']listing["'][^>]*>[\s\S]*?<\/table>/gi,
        'table[summary="Directory Listing"] a[href]':
            /<table\b[^>]+summary=["']Directory Listing["'][^>]*>[\s\S]*?<\/table>/gi
    };

    if (selector === 'a[href]') {
        return extractAnchors(html);
    }

    const pattern = selectors[selector];
    if (!pattern) {
        return [];
    }

    const scopes = html.match(pattern) || [];
    return scopes.flatMap(scopeHtml => extractAnchors(scopeHtml));
}

function hasSelectorMatch(html, selector) {
    switch (selector) {
        case 'div#table-list':
            return /<div[^>]+id=["']table-list["']/i.test(html);
        case 'table#listing':
            return /<table[^>]+id=["']listing["']/i.test(html);
        case 'table.listing':
            return /<table[^>]+class=["'][^"']*\blisting\b[^"']*["']/i.test(html);
        case 'table[summary="Directory Listing"]':
            return /<table[^>]+summary=["']Directory Listing["']/i.test(html);
        case 'nav.breadcrumbs':
            return /<nav[^>]+class=["'][^"']*\bbreadcrumbs\b[^"']*["']/i.test(html);
        case 'pre':
            return /<pre\b/i.test(html);
        default:
            return false;
    }
}

function extractHeading(html, tagName) {
    const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
    return match ? createTextNode(stripHtmlTags(match[1])) : null;
}

class FakeDocument {
    constructor(html) {
        this.html = html;
        this.title = extractTitle(html);
        this.body = createTextNode(stripHtmlTags(html));
    }

    querySelector(selector) {
        if (selector === 'h1' || selector === 'h2') {
            return extractHeading(this.html, selector);
        }

        return hasSelectorMatch(this.html, selector) ? {} : null;
    }

    querySelectorAll(selector) {
        return extractScopedAnchors(this.html, selector);
    }
}

function createDomParser() {
    return class FakeDOMParser {
        parseFromString(html) {
            return new FakeDocument(html);
        }
    };
}

module.exports = {
    createDomParser
};
