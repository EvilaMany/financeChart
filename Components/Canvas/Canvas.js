import CanvasEvents from "./CanvasEvents"



//Абстракция над канвасом
class Canvas {
    constructor(container, config = {}) {
        this.extendCtx()
        //получаем контейнер
        if(typeof container == 'String') {
            container = document.querySelector(container);
        }
        if (!container) return;




        //создаем html-канвал и суев в контейнер


        this.config = config
        this._container = container
        this._canvas = (() => document.createElement('canvas'))()
        this._ctx = (() => this._canvas.getContext('2d'))()

        container.appendChild(this._canvas)

        this.Events = new CanvasEvents(this)

        this.checkSize()
    }

    checkSize() {
        this.config.width = this.container.offsetWidth
        this.config.height = this.container.offsetHeight

        this._canvas.width = this.config.width
        this._canvas.height = this.config.height
    }

    extendCtx() {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        }
    }

    get ctx() {
        return this._ctx
    }
    get container() {
        return this._container
    }

    get canvas() {
        return this._canvas
    }
}

export default Canvas
