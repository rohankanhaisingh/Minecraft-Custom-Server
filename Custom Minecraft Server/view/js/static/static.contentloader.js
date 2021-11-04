(function () {

    const canvas = document.querySelector(".contentloader-canvas");

    /**@type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 30;

    let center = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }

    window.addEventListener("resize", function (event) {

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 30;

        center = {
            x: canvas.width / 2,
            y: canvas.height  / 2
        }

    });


    function randombetween(num1, num2) {
        return Math.floor(Math.random() * (num2 - num1 + 1) + num1);
    }

    const tiles = [];

    class Tile {
        constructor(x, y) {

            this.originX = x;
            this.originY = y;

            this.x = x;
            this.y = y;

            this.opacity = 0;
            this.tickSpeed = .01;

            this.direction = this.tickSpeed;

            this.originSize = 40;
            this.size = 40;

            this.color = `rgb(${randombetween(0, 255)}, ${randombetween(0, 255)}, ${randombetween(0, 255)})`;
            tiles.push(this);
        }

        static size = 40;


        draw() {

            ctx.save();
            ctx.beginPath();

            ctx.globalAlpha = this.opacity;
            ctx.lineWidth = 2;



            ctx.rect(center.x + this.x - (this.size * 2), center.y + this.y - (this.size * 2), this.size, this.size);

            ctx.shadowBlur = 50;
            ctx.shadowColor = this.color;
            

            ctx.fillStyle = this.color;
            ctx.fill();


            ctx.restore();

        }
        update() {


            if (this.opacity > this.tickSpeed) {
                this.opacity -= this.tickSpeed;


            } else {
                this.opacity = 0;
            }

            this.draw();
        }
    }

    let y = 0;

    for (let i = 0; i < 4; i++) {

        for (let j = 0; j < 4; j++) {
            new Tile(j * 40, y * 40);
        }

        y += 1;
    }


    let maxCounterTick = 50,
        counter = maxCounterTick + 10;

    function animateOnInterval(i, color) {

        setTimeout(function () {

            const tile = tiles[i];

            tile.opacity = 1;
            tile.color = color;
            tile.size = tile.originSize;

        }, i * maxCounterTick);

    }

    function update() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let i = 0;

        counter += 1;


        if (counter > maxCounterTick) {

            let color = `rgb(${randombetween(0, 255)}, ${randombetween(0, 255)}, ${randombetween(0, 255)})`;

            for (let o = 0; o < tiles.length; o++) {
                animateOnInterval(o, color);
            }

            counter = 0;
        }

        while (i < tiles.length) {

            const tile = tiles[i];

            tile.update();

            i += 1;
        }


        window.requestAnimationFrame(update);
    }

    update();

})();