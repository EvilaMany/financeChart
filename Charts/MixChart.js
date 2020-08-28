import * as Utils from '../staff/utils.js'

class MixChart {
    constructor(config, canvas, $root) {
        this.config = config
        this.Canvas = canvas
        this.$root = $root

        this.series.sort((a, b) => a[0] - b[0])
    }

    getTimeLimits() {
        let min = null,
            max = null;

        this.series.slice(-100).forEach((curr) => {
            if (min == null || min > curr[0]) {
                min = curr[0]
            }
            if (max == null || max < curr[0]) {
                max = curr[0]
            }
        })

        //let padding = ((max - min) / 10)
        //min = Math.max(min - padding, 0);
        //max += padding;

        return {
            min: min,
            max: max
        }
    }

    getPriceLimits(timeFrom, timeTo) {
        let priceIds = this.priceIds || [1]

        let min = Infinity,
            max = -Infinity;

        let closestToMin = -1,
            closestToMax = -1

        for (let i in this.series) {
            let curr = this.series[i]



            if (closestToMin == -1 && curr[0] > timeFrom) closestToMin = i - 1
            if (closestToMax == -1 && curr[0] > timeTo) closestToMax = i - 1

            if (curr[0] < timeFrom) continue;
            if (curr[0] > timeTo) break;
            priceIds.forEach((id) => {
                min = Math.min(min, curr[id])
                max = Math.max(max, curr[id])
            })
        }

        //console.log(timeFrom, timeTo)
        //console.log(timeFrom, this.series[closestToMin + 1][0], this.series[closestToMin][0])

        if (closestToMin != -1) {
            //какой кусок между двумя ближлежащими точками занимает левая граница таймлайна
            let borderLeftShare = Utils.getShareOfRange(timeFrom, this.series[closestToMin][0], this.series[closestToMin + 1][0])
            let borderLeftPrice = this.series[closestToMin][1] + (this.series[closestToMin + 1][1] - this.series[closestToMin][1]) * borderLeftShare
            min = Math.min(min, borderLeftPrice)
            max = Math.max(max, borderLeftPrice)
        }
        if (closestToMax != -1) {
            //какой кусок между двумя ближлежащими точками занимает правая граница таймлайна
            let borderRightShare = Utils.getShareOfRange(timeTo, this.series[closestToMax][0], this.series[closestToMax + 1][0])
            let borderRightPrice = this.series[closestToMax][1] + (this.series[closestToMax + 1][1] - this.series[closestToMax][1]) * borderRightShare
            min = Math.min(min, borderRightPrice)
            max = Math.max(max, borderRightPrice)
        }


        min = min - ((max - min) / 10);
        min = min < 0 ? 0 : min
        max = max + ((max - min) / 10);

        if (min == Infinity) min = Math.min(this.series[this.series.length - 2][1], this.series[this.series.length - 1][1])
        if (max == -Infinity) max = Math.max(this.series[this.series.length - 2][1], this.series[this.series.length - 1][1])


        return {
            min: min,
            max: max
        }
    }

    addSeries(series) {
        let cloneSeries = Utils.clone(series)

        let i = this.series.push(series) - 1
        this.series.sort((a, b) => a[0] - b[0])

        for (let j = 0; j < this.series.length; j++) {
            if (this.series[j] == series) {
                i = j;
                break;
            }
        }

        let fromState = this.series[i > 0 ? i - 1 : i + 1]
        this.series[i][0] = fromState[0]
        this.series[i][1] = fromState[1]

        let animateObj = {
            time: fromState[0],
            price: fromState[1]
        }

        this.$root.Animator.animateProperty(animateObj, {
            time: cloneSeries[0],
            price: cloneSeries[1]
        }, {
            duration: 500,
            change: () => {
                this.series[i][0] = animateObj.time
                this.series[i][1] = animateObj.price

                this.$root.checkSidebarVisibility()
            }
        })

        if(this.$root.mainChart == this)
        {
            let from = this.$root.timeRange.from
            let to = this.$root.timeRange.to
            if(Utils.getShareOfRange(this.$root.mainChart.series[this.$root.mainChart.series.length - 1][0], from, to) * 100 < 100)
            {
                let timeChange = Math.abs(cloneSeries[0] - fromState[0])
                this.$root.moveTimeline(timeChange)
            }
        }
    }

    get series() {
        return this.config.series
    }

    get ctx() {
        return this.Canvas.ctx
    }
}

export default MixChart
