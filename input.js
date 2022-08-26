class Input {
    constructor() {
        this.click = ''
        this.touch = ''
        this.coords = []
        window.addEventListener('mousedown', (e) => {
            const {x, y} = e
            this.click = 'click'
            if(this.coords.indexOf(x) === -1 && this.coords.indexOf(y) === -1) {
                this.coords.push(x, y)
            }
        })
        window.addEventListener('mouseup', () => {
            this.click = ''
            this.coords = []
        })
        window.addEventListener('touchstart', (e) => {
            const {clientX: x, clientY: y} = e.touches[0]
            this.touch = 'touch'
            if(this.coords.indexOf(x) === -1 && this.coords.indexOf(y) === -1) {
                this.coords.push(x, y)
            }
        })
        window.addEventListener('touchend', () => {
            this.touch = ''
            this.coords = []
        })
    }
}