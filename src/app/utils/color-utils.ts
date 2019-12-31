export class ColorUtils {

    public static lastHue: number = Math.random();
    public static goldenRatioConjugate: number = 0.618033988749895;


    /**
     * Converts an HSV color value to RGB. Conversion formula adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and  returns r, g, and b in the set [0, 255].
     * @param   Number  h   The hue
     * @param   Number  s   The saturation
     * @param   Number  v   The value
     * @return  Array       The RGB representation
     */
    public static hsvToRgb(h: number, s: number, v: number): number[] {
        let r: number;
        let g: number;
        let b: number;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v; g = t; b = p;
                break;
            case 1:
                r = q; g = v; b = p;
                break;
            case 2:
                r = p; g = v; b = t;
                break;
            case 3:
                r = p; g = q; b = v;
                break;
            case 4:
                r = t; g = p; b = v;
                break;
            case 5:
                r = v; g = p; b = q;
                break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }



    /**
     * Converts an RGB color value to HSV. Conversion formula adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and returns h, s, and v in the set [0, 1].
     * @param   Number  r   The red color value
     * @param   Number  g   The green color value
     * @param   Number  b   The blue color value
     * @return  Array       The HSV representation
     */
    public static rgbToHsv(r: number, g: number, b: number): number[] {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        const max: number = Math.max(r, g, b), min = Math.min(r, g, b);
        let h: number = max;
        let s: number = max;
        const v: number = max;

        const d: number = max - min;
        s = max === 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, v];
    }

    

    public static randomHexColor(): string {
        ColorUtils.lastHue += ColorUtils.goldenRatioConjugate;
        ColorUtils.lastHue %= 1;
        const rgb: number[] = ColorUtils.hsvToRgb(ColorUtils.lastHue, 0.25, 0.8);
        return '#' + Number(rgb[0]).toString(16) + Number(rgb[1]).toString(16) + Number(rgb[2]).toString(16);
    }

}