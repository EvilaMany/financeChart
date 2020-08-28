import Component from "./Component"

//Подложка для графиков
class Area extends Component{
    constructor(config, canvas, $root)
    {
        super()

        this.config = config
        this.Canvas = canvas
        this.$root = $root
    }

    render()
    {
        this.renderBase()
    }

    renderBase() {
        this.ctx.fillStyle = this.config.backgroundColor
        this.ctx.fillRect(this.config.x, this.config.y, this.config.width, this.config.height)
    }
}

export default Area
