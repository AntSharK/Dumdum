function ToRGB(color: integer): [integer, integer, integer]{
    var b = color % 0x000100;
    var g = (color % 0x010000 - b) / 0x00100;
    var r = (color - g - b) / 0x010000;

    return [r, g, b];
}

function ToNumber(r: integer, g: integer, b: integer) {
    return r * 0x010000 + g * 0x000100 + b;
}