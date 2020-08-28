import Component from "../Components/Component"
import * as Utils from "../staff/utils.js"

class BetMark extends Component {
    constructor(config, canvas, $root) {
        super()

        this.config = {
            labelColor: 'white',
            labelFontSize: 13,
            lineWidth: 2,
            up: {
                labelColor: '',
                labelBackgroundColor: '#22904e',
                lineColor: '#22904e',

                areaColorFrom: 'rgba(35,48,45,0.6)',
                areaColorTo: 'rgba(35,58,45,1)'
            },
            down: {
                labelColor: '',
                labelBackgroundColor: '#e51b1b',
                lineColor: '#e51b1b',

                areaColorFrom: 'rgba(48,35,45,0.6)',
                areaColorTo: 'rgba(58,35,45,1)'
            }
        }
        Utils.assign(this.config, config)

        this.colors = this.config.bet.side  == 1 ? this.config.up : this.config.down

        this.Canvas = canvas
        this.$root = $root
    }

    render() {
        //this.ctx.globalAlpha = 0.3
        this.Canvas.ctx.lineWidth = this.config.lineWidth

        this.renderArea()
        this.renderBorder()

        this.renderPriceLine()
        this.renderLabel()
    }

    renderLabel()
    {
        let centerX = this.$root.getX(this.config.bet.timeTo)
        let centerY = this.$root.getY(this.config.bet.price)
        let width = Utils.getTextWidth(this.config.bet.price, this.config.labelFontSize + 'px Arial') + 20
        let height = this.config.labelFontSize * 2

        this.Canvas.ctx.fillStyle = this.colors.labelBackgroundColor
        this.Canvas.ctx.roundRect(centerX - width / 2, centerY - height / 2, width, height, 3)
        this.Canvas.ctx.fill()


        this.Canvas.ctx.fillStyle = this.colors.labelColor || this.config.labelColor
        this.Canvas.ctx.fillText(this.config.bet.price, centerX, centerY)
    }

    renderArea() {
        let x,y,width,height;

        x = this.$root.getX(this.config.bet.timeFrom);
        width = this.$root.getX(this.config.bet.timeTo) - x;

        if(this.config.bet.side == 1)
        {
            y = 0
            height = this.$root.getY(this.config.bet.price)
        }
        else
        {
            y = this.$root.getY(this.config.bet.price)
            height = this.$root.config.area.height - y
        }

        let grd = this.Canvas.ctx.createLinearGradient(x, (y+height) / 2, x + width, (y+height) / 2);
        grd.addColorStop(0, this.colors.areaColorFrom);
        grd.addColorStop(1, this.colors.areaColorTo);

        this.Canvas.ctx.fillStyle = grd
        this.Canvas.ctx.fillRect(x, y, width, height)
    }


    renderBorder() {
        let x = this.$root.getX(this.config.bet.timeTo)
        let y, height;
        if(this.config.bet.side == 1)
        {
            y = 0
            height = this.$root.getY(this.config.bet.price)
        }
        else
        {
            y = this.$root.getY(this.config.bet.price)
            height = this.$root.config.area.height - y
        }

        this.Canvas.ctx.lineWidth = this.config.lineWidth
        this.Canvas.ctx.strokeStyle = this.colors.lineColor

        this.Canvas.ctx.beginPath()
        this.Canvas.ctx.moveTo(x, y)
        this.Canvas.ctx.lineTo(x, y+height)
        this.Canvas.ctx.stroke()
    }

    renderPriceLine() {
        let y = this.$root.getY(this.config.bet.price)


        this.Canvas.ctx.strokeStyle = this.colors.lineColor
        this.Canvas.ctx.lineWidth = this.config.lineWidth - 1


        this.Canvas.ctx.beginPath()
        this.Canvas.ctx.moveTo(0, y)
        this.Canvas.ctx.lineTo(this.$root.config.area.width, y)
        this.Canvas.ctx.stroke()
    }
}

export default BetMark
