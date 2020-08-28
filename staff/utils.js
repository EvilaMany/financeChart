export function getTextWidth(text, font = {}) {
    if (typeof font == 'number') {
        font = 'Normal ' + font + 'px Arial'
    } else if (typeof font == 'object') {
        font = (font.style || 'Normal') + ' ' + font.size || '16px' + ' ' + (font.fontFamily || 'Arial')
    }

    let canvas = this.canvas || (this.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

export function getTextHeight(text, font = {}) {
    if (typeof font == 'number') {
        font = 'Normal ' + font + 'px Arial'
    } else if (typeof font == 'object') {
        font = (font.style || 'Normal') + ' ' + font.size || '16px' + ' ' + (font.fontFamily || 'Arial')
    }

    let canvas = this.canvas || (this.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text);
}

export function dotInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return rectX <= x && x <= (rectX + rectWidth) && rectY <= y && y <= (rectY + rectHeight);
}

export function getShareOfRange(numberBetween, rangeFrom, rangeTo) {
    return (numberBetween - rangeFrom) / (rangeTo - rangeFrom)
}

export function clone(array) {
    return JSON.parse(JSON.stringify(array))
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function assign(target) {
    const sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach((source) => {
        Object.keys(source).forEach((key) => {
            // If the target key has an object
            if (key in target && target[key] instanceof Object) {
                // and the source key is also an object
                if (source[key] instanceof Object) {
                    // then merge them (source overwrites same keys).
                    return assign(target[key], source[key]);
                }
            }
            target[key] = source[key];
        });
    });
    return target;
}

export function merge(target) {
    const sources = Array.prototype.slice.call(arguments, 1);
    sources.forEach((source) => {
        Object.keys(source).forEach((key) => {
            // If the target key has an object
            if (key in target && target[key] instanceof Object) {
                // and the source key is also an object
                if (source[key] instanceof Object) {
                    // then merge them (source overwrites same keys).
                    return merge(target[key], source[key]);
                }
                // If the source key is not an object, we don't overwrite the target object.
                return;
            }
            target[key] = source[key];
        });
    });
    return target;
}

export function isTablet() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}
