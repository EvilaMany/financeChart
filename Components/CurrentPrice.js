import Component from "./Component"
import * as Utils from "../staff/utils.js"

class CurrentPrice extends Component {
    constructor(config, canvas, $root) {
        super()

        this.config = config
        this.Canvas = canvas
        this.$root = $root

        this.animation = {
            progress: 0
        }

        this.startAnimation()
    }

    startAnimation() {
        this.$root.Animator.animateProperty(this.animation, {
            progress: 1
        }, {
            complete: () => {
                this.animation.progress = 0
                this.startAnimation()
            },
            duration: this.config.dotShadowDuration
        })
    }

    render() {
        if (!this.$root.mainChart) return;
        let y = this.$root.getY(this.$root.mainChart.getCurrentPrice())
        let x = this.$root.getX(this.$root.mainChart.series[this.$root.mainChart.series.length - 1][0])

        this.renderPriceLine(x, y)
        if (this.$root.mainChart.config.type != 'candlesticks') {
            this.renderShadow(x, y)
            this.renderCircle(x, y)
        }


        this.renderPriceLabel(y)
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
        let text = (this.$root.getPrice(y).toFixed(6)) + '$'

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

export default CurrentPrice
