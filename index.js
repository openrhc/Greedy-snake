// 方向
const Directions = {
  up: {
    x: 0,
    y: -1,
    rotate: -90
  },
  down: {
    x: 0,
    y: 1,
    rotate: 90
  },
  left: {
    x: -1,
    y: 0,
    rotate: 180
  },
  right: {
    x: 1,
    y: 0,
    rotate: 0
  }
}

var stage = null // 舞台
var head = null  // 蛇头
var body = null  // 蛇身
var tail = null  // 蛇尾
var food = null  // 食物
var pos = null  // 存放蛇身体坐标[ [2,0], [1,0], [0,0]]
var direction = null // 蛇运动方向
var score = 0 // 分数

var bgImage = 'url(imgs/bg.png)'      // 地图图片
var headImage = 'url(imgs/head.png)'  // 蛇头图片
var bodyImage = 'url(imgs/body.png)'  // 蛇身图片
var tailImage = 'url(imgs/tail.png)'  // 蛇尾图片
var foodImage = 'url(imgs/food.png)'  // 食物图片

// 生成食物坐标
function getFoodPosition() {
  // 所剩空间已经不足以再生成食物了
  if(stage.row * stage.column === pos.length) {
    return [-1, -1]
  }
  while(1) {
    const x = Math.floor(Math.random() * stage.column)
    const y = Math.floor(Math.random() * stage.row)
    if(pos.every(v => v[0] !== x || v[1] !== y)) {
      return [x, y]
    }
  }
}

// 获取蛇头下一位置
function getHeadPosition() {
  let nextX = head.x + direction.x
  let nextY = head.y + direction.y
  // 判断撞墙
  // if(nextX < 0 || nextX > stage.column - 1) {
  //   console.log('撞到墙了')
  //   return [-1, -1]
  // }
  // if(nextY < 0 || nextY > stage.row - 1) {
  //   console.log('撞到墙了')
  //   return [-1, -1]
  // }
  // 穿墙术
  if(nextX < 0 ) {
    nextX = stage.column - 1
  }
  if(nextX > stage.column - 1) {
    nextX = 0
  }
  if(nextY > stage.row - 1) {
    nextY = 0
  }
  if(nextY < 0) {
    nextY = stage.row - 1
  }
  // 判断撞到自己
  if(pos.some(v => v[0] === nextX && v[1] === nextY)) {
    console.log('撞到自己了')
    return [-1, -1]
  }
  return [nextX, nextY]
}

/**
 * 舞台类
 * @id Element Id
 * @sw 舞台宽度
 * @sh 舞台高度
 * @row 舞台行数
 * @column 舞台列数
 * @style 舞台样式
 */
function Stage(id, sw, sh, row, column, style) {
  this.dom = document.querySelector(id)
  this.width = sw
  this.height = sh
  this.row = row
  this.column = column
  this.wpx = sw / column
  this.hpx = sh / row
  this.timer = -1
  this.dom.innerHTML = ''
  Object.assign(this.dom.style, {
    width: sw + 'px',
    height: sh + 'px',
    position: 'relative',
    backgroundSize: `${this.wpx}px ${this.hpx}px`
  })
  Object.assign(this.dom.style, style)
}

// 将元素加入舞台
Stage.prototype.join = function(block) {
  this.dom.appendChild(block.dom)
}

/**
 * 方块类
 * @className Element ClassName
 * @x 坐标X
 * @y 坐标Y
 */
function Block(className, x, y, style) {
  this.dom = document.createElement('div')
  this.dom.className = className
  this.x = x
  this.y = y
  Object.assign(this.dom.style, {
    position: 'absolute',
    left: x * stage.wpx + 'px',
    top: y * stage.hpx + 'px',
    width: stage.wpx + 'px',
    height: stage.hpx + 'px',
    backgroundSize: '100% 100%'
  })
  Object.assign(this.dom.style, style)
}

Block.prototype.remove = function(){
  this.dom.remove()
}

/**
 * 游戏类
 */
function Game() {
  this.timer = -1
  this.gameover = false
  this.init()
}

Game.prototype.init = function() {
    // 第一步：创建舞台
  stage = new Stage('#stage', 600, 600, 20, 20, {
    backgroundColor: 'pink',
    backgroundImage: bgImage
  })

  // 第二步：创建蛇头
  head = new Block('', 3, 0, {
    backgroundImage: headImage
  })

  // 第三步：创建蛇身、蛇尾
  body = new Block('', 2, 0, {
    backgroundImage: bodyImage
  })

  tail = new Block('', 1, 0, {
    backgroundImage: tailImage
  })

  // 第四步：把蛇头、身加入舞台
  stage.join(head)
  stage.join(body)
  stage.join(tail)

  // 将蛇身加入pos数组
  pos = []
  pos.push([3, 0])
  pos.push([2, 0])
  pos.push([1, 0])

  // 建立链表关系
  head.prev = null
  head.next = body
  body.prev = head
  body.next = tail
  tail.prev = body
  tail.next = null

  // 第五步：生成食物坐标
  const [food_x, food_y] = getFoodPosition()
  if(food_x === -1 && food_y === -1) {
    this.over()
    return
  }

  // 第六步：创建食物
  food = new Block('', food_x, food_y, {
    backgroundImage: foodImage
  })

  // 第七步：将食物加入舞台
  stage.join(food)

  // 第八步：设置蛇的方向
  direction = Directions.right

  // 分数
  score = 0
}

// 开始
Game.prototype.start = function() {
  this.gameover = false
  this.timer = setInterval(() => {
    // 获取新的蛇头坐标
    const [head_x, head_y] = getHeadPosition()
    // 游戏结束
    if(head_x === -1 && head_y === -1) {
      this.over()
      return
    }
    // 生成新的蛇头
    const newHead = new Block('', head_x, head_y, {
      backgroundImage: headImage,
      transform: `rotate(${direction.rotate}deg)`
    })
    // 生成新的蛇身
    const newBody = new Block('', head.x, head.y, {
      backgroundImage: bodyImage,
      transform: `rotate(${direction.rotate}deg)`
    })

    // 去头
    head.remove()

    // 更新链表
    newHead.prev = null
    newHead.next = newBody
    newBody.prev = newHead
    newBody.next = head.next
    head.next.prev = newBody

    head = newHead
    body = newBody

    // 更新存储蛇身坐标的数组(将新的头坐标插入数组前面)
    pos.unshift([head_x, head_y])

    // 吃到食物
    if(head_x === food.x && head_y === food.y) {
      // 移除旧的食物
      food.remove()
      // 生成新的食物坐标
      const [food_x, food_y] = getFoodPosition()
      if(food_x === -1 && food_y === -1) {
        this.over()
        return
      }
      // 创建食物实例
      food = new Block('', food_x, food_y, {
        backgroundImage: foodImage
      })
      // 将食物加入舞台
      stage.join(food)
      // 加分
      score += 10
    }else{
      // 赋予新的尾巴样式
      tail.prev.dom.style.backgroundImage = tailImage
      // 去尾
      tail.remove()
      tail = tail.prev
      tail.next = null
      // 更新存储蛇身坐标的数组(没有吃到食物，删除最后一个坐标)
      pos.pop()
    }

    stage.join(head)
    stage.join(body)
  }, 100)
  console.log('game start')
  document.querySelector('.ui').style.display = 'none'
}

// 暂停或开始
Game.prototype.pause = function() {
  if(this.timer !== -1) {
    clearInterval(this.timer)
    this.timer = -1
    document.querySelector('.ui').style.display = 'flex'
    document.querySelector('.ui .start_btn').style.display = 'none'
    document.querySelector('.ui .restart_btn').style.display = 'none'
    document.querySelector('.ui .score').innerText = '暂停中'
    console.log('game pause')
  }else{
    this.start()
  }
}

// 重新开始
Game.prototype.restart = function(block) {
  this.init()
  this.start()
}

// 结束
Game.prototype.over = function(block) {
  this.gameover = true
  clearInterval(this.timer)
  console.log('game over')
  document.querySelector('.ui').style.display = 'flex'
  document.querySelector('.ui .start_btn').style.display = 'none'
  document.querySelector('.ui .restart_btn').style.display = 'block'
  document.querySelector('.ui .score').innerText = '你的分数：' + score
}

var game = new Game()


// 监听键盘事件
document.addEventListener('keydown', (e) => {
  if(e.keyCode === 37 && direction !== Directions.right) {
    direction = Directions.left
  }else if(e.keyCode === 38 && direction !== Directions.down) {
    direction = Directions.up
  }else if(e.keyCode === 39 && direction !== Directions.left) {
    direction = Directions.right
  }else if(e.keyCode === 40 && direction !== Directions.up) {
    direction = Directions.down
  }
  // 暂停
  if(e.keyCode === 32) {
    if(!game.gameover) {
      game.pause()
    }else{
      game.restart()
    }
  }
})

const skin = document.querySelector('.skin')
skin.style.backgroundImage = bgImage
document.querySelector('.skin .head').style.backgroundImage = headImage
document.querySelector('.skin .body').style.backgroundImage = bodyImage
document.querySelector('.skin .tail').style.backgroundImage = tailImage
document.querySelector('.skin .food').style.backgroundImage = foodImage

var whichSkin = null
skin.addEventListener('click', e => {
  whichSkin = e.target.className
})

// 切换皮肤
function handleSkinChange(file) {
  if(!file.files || !file.files[0]){
    return
  }
  const reader = new FileReader()
  reader.onload = function(e) {
    const base64Image = e.target.result
    console.log(base64Image, whichSkin)
    document.querySelector(`.skin .${whichSkin}`).style.backgroundImage = `url(${base64Image})`
    if(whichSkin === 'food') {
      foodImage = `url(${base64Image})`
    }else if(whichSkin === 'head') {
      headImage = `url(${base64Image})`
    }else if(whichSkin === 'body') {
      bodyImage = `url(${base64Image})`
    }else if(whichSkin === 'tail') {
      tailImage = `url(${base64Image})`
    }else if(whichSkin === 'skin') {
      bgImage = `url(${base64Image})`
    }
  }
  reader.readAsDataURL(file.files[0])
}