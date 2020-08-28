import Component from "./Component"
import * as Utils from "../staff/utils.js"

class Preloader extends Component {
    constructor(config, canvas, $root) {
        super()

        this.config = config
        this.Canvas = canvas
        this.$root = $root
    }


    render() {
        if(this.$root.mainChart.series[0][0] < this.$root.timeRange.from) {
            return;
        }
        let centerY = this.$root.getY(this.$root.priceRange.from + (this.$root.priceRange.to - this.$root.priceRange.from) / 2);

        this.renderRect()
        this.renderPreloader(centerY)
    }

    renderRect() {
        this.ctx.fillStyle = this.config.backgroundColor
        //this.ctx.fillRect(0,0,this.$root.getX(this.$root.mainChart.series[0][0]), this.$root.config.timeline.y )
    }

    renderPreloader(centerY) {
        let text = ''//'Загрузка..';
        let fontSize = '16'

        let centerX = this.$root.getX(this.$root.mainChart.series[0][0]) / 2;
        let textWidth = Utils.getTextWidth(text, fontSize + 'px Arial')
        let minX = this.$root.getX(this.$root.mainChart.series[0][0]) - textWidth / 2 - 10

        this.ctx.fillStyle = this.config.color
        this.ctx.font = fontSize + 'px Arial'
        this.ctx.fillText(text, minX, centerY)
        //console.log(centerX, maxX)
    }

    renderPriceLine(x, y) {
        y = Math.max(y, 0)
        y = Math.min(y, this.$root.config.area.height)
        this.ctx.strokeStyle = this.config.lineColor
        this.ctx.lineWidth = this.config.lineWidth

        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.Canvas.config.width, y)
        this.ctx.stroke()
    }

    renderShadow(x, y) {
        this.ctx.globalAlpha = 1 - this.animation.progress

        this.ctx.fillStyle = this.config.dotShadowColor || this.config.dotColor
        this.ctx.beginPath()
        this.ctx.arc(x, y, this.config.dotShadowRadius * this.animation.progress, 0, 2 * Math.PI, false);
        this.ctx.fill()

        this.ctx.globalAlpha = 1
    }

    renderCircle(x, y) {
        this.ctx.fillStyle = this.config.dotColor
        this.ctx.beginPath()
        this.ctx.arc(x, y, this.config.dotRadius, 0, 2 * Math.PI, false);
        this.ctx.fill()
    }

    renderPriceLabel(y) {
        y = Math.max(y, 0)
        y = Math.min(y, this.$root.config.area.height)
        let fontSize = this.config.labelFontSize
        let text = this.$root.getPrice(y)

        let w = Math.max(Utils.getTextWidth(text, fontSize + 'px Arial') + 10, this.$root.config.sidebar.width)
        let h = (fontSize) * 1.8
        let r = 3
        let x = this.Canvas.config.width - w
        y -= h / 2

        this.ctx.fillStyle = this.config.labelBackgroundColor
        this.ctx.roundRect(x, y, w, h, r)
        this.ctx.fill()

        this.ctx.fillStyle = this.config.labelColor
        this.ctx.font = fontSize + 'px Arial'
        this.ctx.fillText(text, x + w / 2, y + h / 2)
    }
}

export default Preloader
