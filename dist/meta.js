/**
 * parse a string representing an array, but we're flexible.
 * braces are not required. we also allow ranges (e.g. 3-6).
 * so legal values are
 *
 * 3
 * [3]
 * [3,4]
 * 3,4
 * 3,4-6,10
 *
 * but no spaces!
 *
 * @param text
 * @returns
 */
const ParseArrayValue = (text = '') => {
    const result = [];
    if (/^\[.*?\]$/.test(text)) {
        text = text.substring(1, text.length - 1);
    }
    const parts = text.split(/,/g);
    for (const part of parts) {
        if (/-/.test(part)) {
            const [start, end] = part.split('-').map(value => Number(value));
            // because I fucking said so
            if (typeof start === 'number' && typeof end === 'number') {
                if (start < end) {
                    for (let i = start; i <= end; i++) {
                        result.push(i);
                    }
                }
                else {
                    for (let i = start; i >= end; i--) {
                        result.push(i);
                    }
                }
            }
        }
        else {
            result.push(Number(part));
        }
    }
    return result;
};
/**
 * parse a metadata string into an object
 * @param meta
 * @returns
 */
export const ParseMeta = (meta) => {
    const result = {};
    const parts = meta.split(/\s+/g);
    for (const part of parts) {
        if (part === 'preserve-scopes') {
            result.preserve_scopes = true;
            continue;
        }
        if (/=/.test(part) || /^data-[a-z1-9A-Z]*/.test(part)) {
            const [key, value] = part.split('=').map(text => text.trim());
            switch (key) {
                case 'highlight':
                    result.highlight = ParseArrayValue(value);
                    continue;
                case 'show':
                    result.show = ParseArrayValue(value);
                    continue;
                case 'hide':
                    result.hide = ParseArrayValue(value);
                    continue;
                default:
                    if (/^data-[a-z1-9A-Z]*/.test(key)) {
                        let datavalue = value || true;
                        if (!result.data_attributes) {
                            result.data_attributes = {};
                        }
                        if (typeof datavalue === 'string') {
                            if (/^".*"$/.test(datavalue) || /^'.*'$/.test(datavalue)) {
                                datavalue = datavalue.substring(1, datavalue.length - 1);
                            }
                        }
                        result.data_attributes[key] = datavalue;
                        continue;
                    }
            }
            console.info({ key, value });
        }
        console.info('unhandled meta data:', part);
    }
    return result;
};
