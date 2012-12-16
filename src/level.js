var Level = cc.Layer.extend({
    points:null,
    ceiling:null,
    floor:null,
    leftWall:null,
    rightWall:null,
    _brideSprite:null,
    _parallaxSpriteFar:null,
    _parallaxSpriteNear:null,

    _zoom:1,
    ctor:function (tmx) {
        this._super();
        cc.AudioEngine.getInstance().stopMusic();
        if(window.physicsTimer)
        {
            clearInterval(window.physicsTimer);
            window.space = new cp.Space();
            space.iterations = 20;
            space.gravity = cp.v(0, -GRAVITY);
            space.sleepTimeThreshold = 2.2;
            window.physicsTimer = setInterval(function(){
                space.step(1/60)
            }, 1000/60);
        }



        this.points = [];
        this.bags = [];
        this.bagShapes = [];
        window.bagShapes = this.bagShapes;
        window.bags = this.bagShapes;

        this._parallaxSpriteFar = cc.Sprite.create(s_para2PNG);
        this.addChild(this._parallaxSpriteFar);
        this._parallaxSpriteFar.setAnchorPoint(cc.p(0,0));
        this._parallaxSpriteFar.setPosition(0,100);

        this._parallaxSpriteNear = cc.Sprite.create(s_para1PNG);
        this.addChild(this._parallaxSpriteNear);
        this._parallaxSpriteNear.setPosition(0,-300);
        this._parallaxSpriteNear.setAnchorPoint(cc.p(0,0));


        this.map = cc.TMXTiledMap.create(tmx);
        this.addChild(this.map);
        var size = this.map.getContentSize();

        //debug
/*        this.debugNode = cc.PhysicsDebugNode.create(space);
        this.addChild(this.debugNode);
        this.debugNode.setVisible(true);*/



        //create world walls and floors based on size
        this.floor = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(0, 0 - WALL_THICKNESS), cp.v(size.width, 0 - WALL_THICKNESS), WALL_THICKNESS));
        this.ceiling = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(0, size.height + WALL_THICKNESS), cp.v(size.width, size.height + WALL_THICKNESS), WALL_THICKNESS));
        this.leftWall = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(0 - WALL_THICKNESS, size.height), cp.v(0 - WALL_THICKNESS, 0), WALL_THICKNESS));
        this.rightWall = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(size.width + WALL_THICKNESS, size.height), cp.v(size.width + WALL_THICKNESS, 0), WALL_THICKNESS));
        this.floor.setFriction(1);
        this.ceiling.setFriction(1);
        this.leftWall.setFriction(1);
        this.rightWall.setFriction(1);

        var ropeDrawNode = cc.Node.create();
        ropeDrawNode.draw = function(ctx){
            var controlPoints = player.getBezierControlPoints();
            if(controlPoints){
                cc.renderContext.strokeStyle = "rgba(92,85,51,1)";
                cc.renderContext.lineWidth = "5";

                cc.drawingUtil.drawCubicBezier(controlPoints[0], controlPoints[1],
                    controlPoints[2], controlPoints[3], 100);
            }
        };
        this.addChild(ropeDrawNode,9);

        this.setMouseEnabled(true);

        var group = this.map.getObjectGroup("Objects");
        var array = group.getObjects();
        for (var i = 0; i < array.length; i++) {
            if (array[i]["name"] === "actor") {
                if (array[i]["type"] === "player") {
                    var playerObj = array[i];
                    window.player = Player.create(cp.v(playerObj.x, playerObj.y));
                    window.player.setBackgroundLayer(this);
                    player.ropeLength = parseInt(array[i]["rope"]);
                    this.addChild(player,5);
                }
                else if (array[i]["type"] === "bride") {
                    this._brideSprite = Bride.create(cc.p(array[i].x+array[i].width/2,array[i].y+array[i].height/2));
                    this.addChild(this._brideSprite,8);
                }
                else if(array[i]["type"] === "groom"){
                    var groom = Groom.create(cc.p(array[i].x+array[i].width/2,array[i].y+array[i].height/2));
                    this.addChild(groom);
                    this._groomSprite = groom;
                }
                else if(array[i]["type"] === "priest"){
                    var priest = Priest.create(cc.p(array[i].x+array[i].width/2,array[i].y+array[i].height/2));
                    this.addChild(priest);
                    this._priestSprite = priest;
                }
            } else if (array[i]["name"] === "scene"){
                var groundObj = array[i];
                var groudBody = new cp.StaticBody();
                groudBody.setPos(cp.v(groundObj.x+ groundObj.width/2, groundObj.y + groundObj.height/2));
                var groundShape = new cp.BoxShape(groudBody, groundObj.width, groundObj.height);
                groundShape.setFriction(1);
                groundShape.setElasticity(0.5);
                space.addShape(groundShape);
            }
            else if(array[i]["name"] === "object"){
                var o = array[i];
                var img = items[o["type"]]["img"];
                var polies = items[o["type"]]["polies"];
                console.log(items[o["type"]]);

                var scenery = new Item(img, cc.p(o.x, o.y), parseInt(o["weight"]), polies);
                scenery.addTo(this);
            }

        }
        //add player

    },

    setPosition:function(x,y){
        var oldPositionX = this.getPositionX();
        var position;
        if(arguments.length == 1){
            position = x;
        }
        if(arguments.length == 2)
            position = cc.p(x,y);
        this._super(position);

        var deltaX = position.x - oldPositionX;
        this._parallaxSpriteFar.setPosition(this._parallaxSpriteFar.getPositionX() - deltaX * 0.75, this._parallaxSpriteFar.getPositionY());
        this._parallaxSpriteNear.setPosition(this._parallaxSpriteNear.getPositionX() - deltaX * 0.5, this._parallaxSpriteNear.getPositionY())
    },

    onMouseDown:function (e) {
        this.mouseStart = e.getLocation();
        //check if we are clicking the player
        if (player && !isGameWon) {
            var playerPos = player.getPosition();
            var playerSize = player.getContentSize();
            var LOffset = this.getPosition();
            var p = cc.p(this.mouseStart.x - LOffset.x, this.mouseStart.y - LOffset.y);
            if (cc.rectContainsPoint(cc.rect(playerPos.x - playerSize.width / 2, playerPos.y - playerSize.height / 2, playerSize.width, playerSize.height), p)) {
                this.isShooting = true;
            }
        }
    },

    onMouseDragged:function (e) {
        if (this.isShooting) {
            this.dragPos = e.getLocation();
        }
        else {
            var delta = e.getDelta();
            var diff = cc.pAdd(delta, this.getPosition());
            if (diff.x > 0) {
                diff.x = 0
            }
            else if (diff.x < cc.canvas.width - this.map.getContentSize().width) {
                diff.x = cc.canvas.width - this.map.getContentSize().width;
            }
            if (diff.y > 0) {
                diff.y = 0;
            }
            else if (diff.y < cc.canvas.height - this.map.getContentSize().height) {
                diff.y = cc.canvas.height - this.map.getContentSize().height;
            }
            this.setPosition(diff);
        }
    },
    onMouseUp:function () {
        //findout the angle between the dragged pos and start pos
        if (this.isShooting) {
            var impulse = cp.v.mult(cp.v(this.mouseStart.x - this.dragPos.x, this.mouseStart.y - this.dragPos.y), 5);
            this.bagShapes.push(player.throwBag(impulse));
/*            var dX = this.dragPos.x - this.mouseStart.x;
            var dY = this.dragPos.y - this.mouseStart.y;
            var angleDEG = Math.atan2(dY, dX) * 180 / Math.PI;*/


            this.isShooting = false;
        }
    },
    onScrollWheel:function(e){
        //e.preventDefault();
        //e is either +120 or -120
        //we want to keep zoom between 0.25 - 1;
/*        var value = e.getWheelDelta()*0.00025;
        this._zoom = Math.max(Math.min(this._zoom+value, 1),0.75);
        this.setScale(this._zoom);
        var pos = this.getPosition();
        this.setAnchorPoint(cc.p(1,1));
        console.log(this.isIgnoreAnchorPointForPosition(), this.getAnchorPoint());
        return false;*/
    },
    removeBag:function(){

    },
    update:function(){
    },

    _moveCamera:function(){
        if(!this._brideSprite)
            return;

        var bridePosition = this._brideSprite.getPosition();
        var playerPosition = player.getPosition();
        var winSize = cc.Director.getInstance().getWinSize();

        var centerPointer = cc.p(winSize.width /2 - bridePosition.x, winSize.height /2 - bridePosition.y);
        var moveToPointer = cc.p(winSize.width/ 3 - playerPosition.x, winSize.height /2 - playerPosition.y);
        this.setPosition(centerPointer);

        this.runAction(cc.Sequence.create(cc.DelayTime.create(1.5),cc.MoveTo.create(1.0, moveToPointer)));
    },

    resetCamera:function(){
        var playerPosition = player.getPosition();
        var winSize = cc.Director.getInstance().getWinSize();

        var moveToPointer = cc.p(winSize.width/ 3 - playerPosition.x, winSize.height /2 - playerPosition.y);
        this.runAction(cc.MoveTo.create(1.5, moveToPointer));
    },

    onEnter:function(){
        this._super();

        this.plot = new MiniScript(PriestScript, this._brideSprite, this._groomSprite, this._priestSprite);
        this.plot.next();

        this._moveCamera();
        this.scheduleUpdate();
        this.ignoreAnchorPointForPosition(false);
        for(var i = 0; i< 35; i++)
            space.step(1/60);
    }
});
