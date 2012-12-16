var MainMenu = cc.Layer.extend({
    isMenu:true,
    ctor:function(){

        //load tilemap
        this.map = cc.TMXTiledMap.create(s_mainmenu);
        this.addChild(this.map);

        //debug
/*        this.debugNode = cc.PhysicsDebugNode.create(space);
        this.addChild(this.debugNode);
        this.debugNode.setVisible(true);*/


        //setup actors
        var group = this.map.getObjectGroup("Objects");
        var obj = group.getObjects();
        for(var i = 0; i < obj.length; i++)
        {
            var ob = obj[i];
            if(ob.name === "actor"){
                console.log(ob);
                if(ob.type === "bride")
                {
                    this.bride = Bride.create(cc.p(ob.x+ob.width/2,ob.y+ob.height/2));
                    this.addChild(this.bride);
                }
                else if(ob.type === "groom")
                {
                    this.groom = Groom.create(cc.p(ob.x+ob.width/2,ob.y+ob.height/2));
                    this.addChild(this.groom);
                }
                else if(ob.type === "priest")
                {
                    this.priest = Priest.create(cc.p(ob.x+ob.width/2,ob.y+ob.height/2));
                    this.addChild(this.priest);
                }
            }
            else if(ob["name"] === "object"){
                var img = items[ob["type"]]["img"];
                var polies = items[ob["type"]]["polies"];
                var scenery = new Item(img, cc.p(ob.x, ob.y), parseInt(ob["weight"]), polies);
                scenery.addTo(this);
            }
            else if(ob.name === "scene"){
                var groundObj = ob;
                var groudBody = new cp.StaticBody();
                groudBody.setPos(cp.v(groundObj.x+ groundObj.width/2, groundObj.y + groundObj.height/2));
                var groundShape = new cp.BoxShape(groudBody, groundObj.width, groundObj.height);
                groundShape.setFriction(1);
                groundShape.setElasticity(0.5);
                space.addShape(groundShape);
            }
            this.setPosition(cc.p(-160,-36));
        }
        //create player offScreen
        window.player = Player.create(cp.v.add(this.bride.getPosition(), cc.p(0, 600)));
        player.setBackgroundLayer(this);
        this.addChild(player,5);
        space.addCollisionHandler(COLBRIDE, COLBAG, null, this.checkCatch.bind(this));
        space.addCollisionHandler(COLBRIDE, COLPLAYER, this.toCreateLogo.bind(this));
        space.addCollisionHandler(COLBRIDE, 99, function(){return false});
        space.addCollisionHandler(99, COLGROOM, this.playButton.bind(this));
        window.bagShapes = this.bagShapes = [];
        window.bags = this.bagShapes = [];
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
    },
    onEnter:function(){
        this._super();
        var blue = cc.LayerGradient.create(cc.c4b(169,236,244,255),cc.c4b(118,192,199,255));
        this.addChild(blue,-1);
        blue.setPosition(cc.p(160,36));
        this.setMouseEnabled(true);
        for(var i = 0; i < 20; i++)
        {
            space.step(1/60);
        }
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
        window.physicsTimer = setInterval(function(){
            space.step(1/60)
        }, 1000/60);
        this.plot = new MiniScript(menuScript, this.bride, this.groom, this.priest);
        this.plot.next();

        //cc.AudioEngine.getInstance().playMusic(s_bagabrideSong);
        //the priest will say something, should provide option to skip

        //then throw a rope

        //then pull the rope

        //then logo comes down
    },
    onMouseUp:function(){
        this.plot.next();
    },
    checkCatch:function (e) {
        var bag = (e.a.collision_type === COLBAG) ? e.a : e.b;
        var actor = (e.a.collision_type === COLBRIDE || e.a.collision_type === COLGROOM) ? e.a : e.b;
        //console.log(bag.body.getPos());
        if (actor.pointQuery(bag.body.getPos())) {
            //catch
            this.catchActor(actor, bag);
        }
        return false;
    },
    catchActor:function (a, b) {
        a._node.caught();
        b.toRmove = true;
        //space.removeShape(b);
    },
    toCreateLogo:function()
    {
        if(!this.willCreateLogo)
        {
            this.schedule(this.createLogo,0,0);
            this.willCreateLogo = true;
        }
    },
    createLogo:function(){
        var logo = cc.PhysicsSprite.create(s_logo);
        var body = new cp.Body(2000,cp.momentForBox(2000, 647,91));
        body.setPos(cc.p(650, 700));
        var shape = new cp.BoxShape(body,647,91);
        shape.setFriction(1);
        shape.setElasticity(0.5);
        shape.collision_type = 99;
        space.addShape(shape);
        space.addBody(body);
        logo.setBody(body);
        this.addChild(logo);
    },
    playButton:function(){
        var play = cc.MenuItemImage.create(s_play,s_play, this.playGame.bind(this));
        var menu = cc.Menu.create(play);
        this.addChild(menu);
        play.setPosition(cc.p(cc.canvas.width/6, cc.canvas.height/4));
        play.setScale(2);
        return true;
    },
    playGame:function(){
        cc.Director.getInstance().replaceScene(new gameScene());
        console.log("play");
    }
});