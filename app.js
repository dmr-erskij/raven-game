/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas1')
const bgImage = document.getElementById('bg-game')
const restartBtn = document.getElementById('restart')
const mainSound = document.getElementById('raven-audio')
const endSound = document.getElementById('end-audio')
const startBtn = document.getElementById('start')
const ctx = canvas.getContext('2d')
const CANVAS_WIDTH = (canvas.width = window.innerWidth)
const CANVAS_HEIGHT = (canvas.height = window.innerHeight)

const collisionCanvas = document.getElementById('collision-canvas')
const collisionCtx = collisionCanvas.getContext('2d')
const COLLISION_WIDTH = (collisionCanvas.width = window.innerWidth)
const COLLISION_HEIGHT = (collisionCanvas.height = window.innerHeight)
let isMobile = false
let deviceWidth = window.innerWidth

ctx.font = '50px Impact'
const frame = 30
let speed = 1000 / frame
let lastTime = 0


window.addEventListener('load', () => {
    if(deviceWidth <= 920) {
        isMobile = true
    }
   
    window.addEventListener('mousemove', e => {
        weapon.update(e.x, e.y)
    })
    startBtn.addEventListener('pointerdown', () => {
        document.body.classList.remove('before-start')
        mainSound.muted = false
        mainSound.play()
        animate(0)
    })
    restartBtn.addEventListener('pointerdown', () => {
        document.body.classList.remove('end-game')
        game.restart()
        animate(0)
        mainSound.muted = false
    })

})

window.addEventListener('resize', () => {
    deviceWidth = window.innerWidth
})


class Game {
    constructor(context, width, height) {
        this.context = context
        this.width = width
        this.height = height
        this.ravens = []
        this.explosion = []
        this.collisionData = []
        this.input = new Input()
        this.score = 0
        this.losenRaven = 0
        this.interval = 500
        this.timer = 0
        this.gameOver = false
        this.light = 100

    }
    update(deltaTime) {
        this.ravens = this.ravens.filter(raven => !raven.markToDelete)
        this.explosion = this.explosion.filter(expl => !expl.markToDelete)
        if(this.timer > this.interval) {
            this.#addNewRaven()
            this.timer = 0
        } else {
            this.timer += deltaTime         
        }
        this.ravens.forEach(raven => raven.update(deltaTime))
        this.explosion.forEach(expl => expl.update(deltaTime))
        this.ravens.forEach(raven => raven.losenRaven && this.losenRaven++)
        if(this.losenRaven % 1 === 0 && this.losenRaven !== 0) this.light -= 0.05
        if(this.losenRaven > 20) {
            this.gameOver = true
        }
    }
    draw() {
        this.ravens.sort((a,b) => a.width - b.width).forEach(raven => raven.draw(this.context))
        this.explosion.forEach(expl => expl.draw(this.context))
    }
    inputHandler() {
        if(this.input.click === 'click' || this.input.touch === 'touch') {
            const [x, y] = this.input.coords
            const {data} = collisionCtx.getImageData(x, y, 1, 1)
            this.collisionData = [...data]
            this.ravens.forEach(raven => {
                if(raven.randomColors[0] === this.collisionData[0] &&
                    raven.randomColors[1] === this.collisionData[1] &&
                    raven.randomColors[2] === this.collisionData[2]) {
                        raven.markToDelete = true
                        this.score++
                        this.explosion.push(new Explosion(raven.x, raven.y, raven.width))
                    }
            })
        }
    }
    drawScore() {
        ctx.fillStyle = '#fff'
        ctx.shadowBlur = '10'
        ctx.shadowColor = '#fff'
        if(!isMobile) {
            ctx.fillText('ОЧКИ: ' + this.score, 50, 75)
            ctx.fillStyle = `hsl(0, 100%, ${this.light}%)`
            ctx.fillText('ПРОПУЩЕНО: ' + this.losenRaven, 300, 75)
            ctx.fillStyle = '#fff'
        } else {
            ctx.font = '25px Impact'
            ctx.fillText('ОЧКИ: ' + this.score, 30, 50)
            ctx.fillStyle = `hsl(0, 100%, ${this.light}%)`
            ctx.fillText('ПРОПУЩЕНО: ' + this.losenRaven, 30, 90)
            ctx.fillStyle = '#fff'
        }
        ctx.shadowBlur = '0'    
    }
    restart() {
        this.gameOver = false
        this.ravens = []
        this.score = 0
        this.losenRaven = 0
        this.light = 100
    }
    #addNewRaven() {
        this.ravens.push(new Raven(this))
    }
}


class Raven {
    constructor(game) {
        this.game = game
        this.image = new Image()     
        this.image.src = './assets/raven.png'
        this.spriteWidth = 271
        this.spriteHeight = 194
        isMobile ? this.sizeModifier = Math.random() * 0.3 + 0.3 : this.sizeModifier = Math.random() * 0.4 + 0.4
        this.width = this.spriteWidth * this.sizeModifier
        this.height = this.spriteHeight * this.sizeModifier
        this.frame = 0
        this.maxFrame = 4
        this.x = this.game.width
        this.y = Math.random() * (CANVAS_HEIGHT - this.height)
        this.angle = 0
        this.curve = Math.random() * 5 + 2
        this.period = Math.random() * 6 + 2
        this.vx = Math.random() * 9 + 3   
        this.vy = Math.random() * 4 - 2.5   
        this.markToDelete = false
        this.losenRaven = false
        this.speed = 40
        this.timer = 0
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = `rgb(${this.randomColors[0]}, ${this.randomColors[1]}, ${this.randomColors[2]})`
    }
    update(deltaTime) {
        if(this.y < 0 || this.y > this.game.height - this.height) {
            this.vy = -this.vy
        }
        this.x -= this.vx
        this.y += this.vy + Math.sin(this.angle * Math.PI/this.period) * this.curve
        this.angle++
        this.vx >= 6 ? this.speed = 6 : this.speed = 60
        if(this.x < 0 - this.width) {
            this.markToDelete = true
            this.losenRaven = true
        }
        if(this.timer > this.speed) {
         this.frame > this.maxFrame ? this.frame = 0 : this.frame += 1  
         this.timer = 0
        } else this.timer += deltaTime
    }
    draw(ctx) {
        collisionCtx.fillStyle = this.color
        collisionCtx.fillRect(this.x, this.y, this.width, this.height)
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
}

class Explosion {
    constructor(x, y, size) {
        this.image = new Image()
        this.image.src = './assets/boom.png'
        this.spriteWidth = 200
        this.spriteHeight = 179
        this.size = size
        this.x = x
        this.y = y
        this.frame = 0
        this.sound = new Audio()
        this.sound.src = './assets/boom.mp3'
        this.interval = 100
        this.timer = 0
        this.markToDelete = false
    }
    update(deltaTime) {
        if(this.frame === 0) this.sound.play()
        if(this.timer > this.interval) {
            this.frame > 4 ? this.markToDelete = true : this.frame += 1
            this.timer = 0
        } else this.timer += deltaTime
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.size, this.size)
    }
}

class Weapon {
    constructor() {
        this.x = null
        this.y = null
        this.width = 120
        this.height = 100
        this.image = new Image()
        this.image.src = './assets/aim2.png'
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
    update(x, y) {
        this.x = x - this.width / 2
        this.y = y - this.height / 2
    }
}

const game = new Game(ctx, CANVAS_WIDTH, CANVAS_HEIGHT)
const weapon = new Weapon()

function animate(timestamp) {
    let deltaTime = timestamp - lastTime
    if(deltaTime > speed) {
        collisionCtx.clearRect(0, 0, COLLISION_WIDTH, COLLISION_HEIGHT)
        if(!isMobile) {
            ctx.drawImage(bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        } else {
            ctx.drawImage(bgImage, 0 - CANVAS_WIDTH, 0, CANVAS_WIDTH * 3, CANVAS_HEIGHT)
        }
        game.drawScore()
        game.draw()
        game.update(deltaTime)
        game.inputHandler()
        if(!isMobile) weapon.draw(ctx)
        lastTime = timestamp
    }
    if(!game.gameOver) requestAnimationFrame(animate)
    if(game.gameOver) {
        document.body.classList.add('end-game')
        mainSound.muted = true
        endSound.play()
        if(!isMobile) {
            ctx.shadowBlur = '10'
            ctx.fillText('ИГРА ОКОНЧЕНА, ТЫ НАБРАЛ: ' + game.score + ' ОЧКОВ!', CANVAS_WIDTH / 3.5 , CANVAS_HEIGHT / 2) 
            ctx.shadowBlur = '10' 
        } else {
            ctx.font = '25px Impact'
            ctx.shadowBlur = '10'
            ctx.fillText('ИГРА ОКОНЧЕНА, ТЫ НАБРАЛ:', 30, 220) 
            ctx.font = '55px Impact'  
            ctx.fillText(game.score + ' ОЧКОВ!', 30, 300)   
            ctx.font = '50px Impact' 
            ctx.shadowBlur = '10'
        }
    }   
}

