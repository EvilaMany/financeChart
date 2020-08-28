import Component from "./Component"

//Подложка для графиков
class Crosshair extends Component {
    constructor(config, canvas, $root)
    {
        super()

        this.config = config
        this.Canvas = canvas
        this.$root = $root

        this.bindEvents()
    }

    render(Canvas)
    {
        this.ctx.strokeStyle = this.config.lineColor
        this.ctx.lineWidth = this.config.lineWidth
        this.ctx.setLineDash(this.config.lineDash)

        this.renderTime()
        this.renderPrice()

        this.ctx.setLineDash([1,0])
    }

    renderTime()
    {
        this.ctx.beginPath()
        this.ctx.moveTo(this.x, 0)
        this.ctx.lineTo(this.x, this.Canvas.config.height)
        this.ctx.stroke()
    }

    renderPrice()
    {
        this.ctx.beginPath()
        this.ctx.moveTo(0, this.y)
        this.ctx.lineTo(this.Canvas.config.width, this.y)
        this.ctx.stroke()
    }

    bindEvents() {
        this.Canvas.canvas.addEventListener('timezone:pointermove', (e) => {
            let posX = e.originalEvent.offsetX
            let posY = e.originalEvent.offsetY

            this.x = posX
            this.y = posY
        })

        this.Canvas.canvas.addEventListener('timezone:pointerout', (e) => {
            this.x = -1
            this.y = -1
        })
    }
}

export default Crosshair
