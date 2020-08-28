import Component from "./Component"

//Сетка рисующаяся на отображаемых метках времени и цены
class Grid extends Component {
    constructor(config, canvas, verticalLabels, horizontalLabels, $root) {
        super();

        this.config = config
        this.Canvas = canvas
        this.verticalLabels = verticalLabels
        this.horizontalLabels = horizontalLabels
        this.$root = $root
    }

    render() {
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        let defaultColor = this.config.lineColor
        this.ctx.lineWidth = this.config.lineWidth

        this.ctx.strokeStyle = this.config.yColor || defaultColor
        this.verticalLabels.forEach((x) => {
            this.drawVerticalLine(x.x)
        })

        this.ctx.strokeStyle = this.config.xColor || defaultColor
        this.horizontalLabels.forEach((y) => {
            this.drawHorizontalLine(y.y)
        })
    }


    drawVerticalLine(x) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, this.$root.config.timeline.y - 1)
        this.ctx.lineTo(x, 0)
        this.ctx.stroke()
    }

    drawHorizontalLine(y) {
        this.ctx.beginPath()
        this.ctx.moveTo(this.$root.config.sidebar.x - 1, y)
        this.ctx.lineTo(0, y)
        this.ctx.stroke()
    }
}

export default Grid
