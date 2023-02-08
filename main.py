from browser import document, window, alert
import random 

def sketch(p): 
  #this p is needed. it will be the processing sketch itself.
  # to do things like background(0) instead do p.background(0)

    def setup():
        p.createCanvas(700, 410)
        p.background(255)
        p.rectMode(p.CENTER)
    

    def draw():
        colorlist = ['purple','red', 'yellow', 'turquoise', 'orange']
        p.noStroke()
        p.fill(random.choice(colorlist))
        p.ellipse(p.mouseX,p.mouseY,50,50)

    
    def mousePressed(self):
        p.background(0)
    

    def keyPressed(self):
      if p.key==" ":
        print("Hallo")
    

    p.setup = setup
    p.draw = draw
    p.mousePressed = mousePressed
    p.keyPressed = keyPressed
      
myp5 = window.p5.new(sketch)
