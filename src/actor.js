var Actor = cc.PhysicsSprite.extend({
    _actorBody:null,
    _collisionRect:null,
    text:null,
    textAr:null,
    textIndex:0,
    runScript:function(script,plot){
        //if its a string, say something
        this.plot = plot;
        this.say(script);
    },
    createDialogBox:function(s){
        if(this.dialog)
        {
            this.removeChild(this.dialog,true);
            this.dialog = null;
        }
        this.dialog = cc.Sprite.create(s);
        this.dialog.setAnchorPoint(cc.p(0.5,0.0));
        this.dialog.setPosition(cc.p(this.getContentSize().width/2, this.getContentSize().height));
        this.dialog.setScale(0.01);
        var pop = cc.ScaleTo.create(1.5, 1);
        var easedPop = cc.EaseElasticOut.create(pop, 0.25);
        this.dialog.runAction(easedPop);
    },
    say:function(msg)
    {
        this.unschedule(this.addText);
        this.textIndex = 0;
        //find how many words in sentence
        var ar = msg.split(" ");
        this.textAr = ar;
        if(ar.length < 3)
        {
            //tiny dialog
            this.createDialogBox(s_dialogTiny);
        }
        else if(ar.length < 12){
            //small dialog
            this.createDialogBox(s_dialogSmall);
        }
        else{
            //big dialog
            this.createDialogBox(s_dialogBig);
        }
        var dSize = this.dialog.getContentSize();
        dSize.width -= 10;
        this.text = cc.LabelTTF.create("", "", 16, dSize, cc.TEXT_ALIGNMENT_CENTER);
        this.text.setColor(cc.c3b(0,0,0));
        this.text.setPosition(cc.p((dSize.width+10)/2, dSize.height/4));
        this.dialog.addChild(this.text);
        this.addChild(this.dialog);
        this.schedule(this.addText, 0.65);
    },
    addText:function()
    {
        if(this.text && this.textAr)
        {
            if(this.textAr.length <= this.textIndex)
            {
                //tell plot we are finished
                this.unschedule(this.addText);
                MiniScript.timer = setTimeout(this.closeBox.bind(this), 3000);
                //this.schedule(this.closeBox,3,0);
                console.log("finished saying");
                this.textIndex = 0;
                return;
            }
            var disText = "";
            for(var i = 0; i <= this.textIndex; i++)
            {
                disText += this.textAr[i]+" ";
            }
            this.text.setString(disText);
            this.textIndex++;
            this.playWord();
        }
    },
    closeBox:function(){
        var pop = cc.ScaleTo.create(0.5, 0.01);
        var easedPop = cc.EaseOut.create(pop, 0.25);
        this.dialog.runAction(cc.Sequence.create(easedPop, cc.CallFunc.create(this.cleanBox,this)));
    },
    cleanBox:function(){
        this.removeChild(this.dialog,true);
        this.dialog = null;
        if(this.plot)
        this.plot.next();
    },
    playWord:function(){}
});
var Groom = Actor.extend({
    initBody:function (position) {
        this._actorBody = new cp.Body(MAN_WEIGHT, cp.momentForBox(MAN_WEIGHT, 30, 96));
        this._actorBody.setPos(cp.v(position.x, position.y));
        space.addBody(this._actorBody);
        var shape = new cp.BoxShape(this._actorBody, 30, 96);
        shape.setFriction(1);
        shape.setElasticity(0.5);
        shape.setCollisionType(COLGROOM);
        shape._node = this;
        this._shape = shape;
        space.addShape(shape);

        this.setBody(this._actorBody);
    }
});
Groom.create = function (position) {
    var ret = new Groom();
    ret.initWithFile(s_groomPNG);
    ret.initBody(position);
    return ret;
};
var Priest = Actor.extend({
    sounds:7,
    initBody:function (position) {
        this._actorBody = new cp.Body(MAN_WEIGHT, cp.momentForBox(MAN_WEIGHT, 35, 96));
        this._actorBody.setPos(cp.v(position.x, position.y));
        space.addBody(this._actorBody);
        var shape = new cp.BoxShape(this._actorBody, 35, 96);
        shape.setFriction(1);
        shape.setElasticity(0.5);
        shape.setCollisionType(COLGROOM);
        shape._node = this;
        this._shape = shape;
        space.addShape(shape);

        this.setBody(this._actorBody);
    },
    playWord:function(){
        var i = 0|(Math.random()*7+1);
        cc.AudioEngine.getInstance().playEffect(window["s_p"+i]);
    },
    say:function(msg){
        this._super(msg);
        if(msg === "Blah blah blah blah...")
        {
            cc.AudioEngine.getInstance().playMusic(s_bagabrideSong);
        }

    }
});
Priest.create = function (position) {
    var ret = new Priest();
    ret.initWithFile(s_priestPNG);
    ret.initBody(position);
    return ret;
};
var Bride = Actor.extend({
    say:function(msg){
        this._super(msg);
        if(msg === "I ...")
        {
            window.bagShapes.push(player.throwBag(cp.v(0,-50)));
        }
    },
    initBody:function (position) {
        this._actorBody = new cp.Body(GIRL_WEIGHT, cp.momentForBox(GIRL_WEIGHT, 40, 96));
        this._actorBody.setPos(cp.v(position.x, position.y));
        this._actorBody.bride = true;
        space.addBody(this._actorBody);
        var brideShape = new cp.BoxShape(this._actorBody, 40, 96);
        brideShape.setFriction(1);
        brideShape.setElasticity(0.5);
        brideShape.setCollisionType(COLBRIDE);
        brideShape._node = this;
        this._shape = brideShape;
        space.addShape(brideShape);

        this.setBody(this._actorBody);

        //make her hold a flower
        this._flower = cc.Sprite.create(s_flowerPNG);
        this.addChild(this._flower);
        this._flower.setPosition(cc.p(56, 48));
    },
    talking:function () {
    },
    caught:function () {
        if (!this.isCaught) {
            cc.AudioEngine.getInstance().playEffect(s_screamMP3);
            cc.AudioEngine.getInstance().playEffect(s_catchMP3);
            this.setTexture(cc.TextureCache.getInstance().addImage(s_bagPNG));
            this.toBeCaught = true;
            this.scheduleUpdate();
            this.isCaught = true;
            player.gotBride = true;
            this.say("ahhhh");
        }
    },
    update:function () {
        //space.removeShape(this._shape);
        //space.removeBody(this._actorBody);
        if (this.toBeCaught) {
            var prevBody = this._actorBody;
            this._actorBody = new cp.Body(GIRL_WEIGHT, cp.momentForPoly(GIRL_WEIGHT * 0.05, [-7, -30  , 1, -21  , 11, -29], cp.v(0, 0))
                + cp.momentForPoly(GIRL_WEIGHT * 0.85, [-6, -22  , -13, -14  , -12, 21  , 11, 21  , 12, -13  , 5, -23], cp.v(0, 0))
                + cp.momentForPoly(GIRL_WEIGHT * 0.1, [-15, 30  , 14, 28 , 11, 21  , -12, 21 ], cp.v(0, 0)));
            space.removeBody(prevBody);
            space.addBody(this._actorBody);
            this.setBody(this._actorBody);
            space.removeShape(this._shape);
            player.bagRemoved();
            var shape1 = new cp.PolyShape(this._actorBody, [-7, -30  , 1, -21  , 11, -29], cp.v(0, 0));
            var shape2 = new cp.PolyShape(this._actorBody, [-6, -22  , -13, -14  , -12, 21  , 11, 21  , 12, -13  , 5, -23 ], cp.v(0, 0));
            var shape3 = new cp.PolyShape(this._actorBody, [-15, 30  , 14, 28 , 11, 21  , -12, 21 ], cp.v(0, 0));
            [shape1, shape2, shape3].forEach(function (shape) {
                shape.setFriction(1);
                shape.setElasticity(0.5);
                shape.setCollisionType(COLBRIDE);
                shape._node = this;
                space.addShape(shape);
            }, this);
            this._actorBody.setPos(prevBody.getPos());
            this._actorBody.w = prevBody.w;
            this._actorBody.t = prevBody.t;
            player.catchActor(this);
            this.toBeCaught = false;

            //drop the flower
            this.removeChild(this._flower);
            var physicsFlower = cc.PhysicsSprite.create(s_flowerPNG);
            var pfbody = new cp.Body(0.5, cp.momentForPoly(0.5, [-4, 16, 12, 4 , -8, -16], cp.v(0, 0)));
            physicsFlower.setBody(pfbody);
            var pfshape = new cp.PolyShape(pfbody, [-4, 16, 12, 4 , -8, -16], cp.v(0, 0));
            pfshape.setFriction(1);
            pfshape.setElasticity(0);
            space.addBody(pfbody);
            space.addShape(pfshape);
            physicsFlower.setPosition(cc.p(this.getPositionX(), this.getPositionY()));
            this.getParent().addChild(physicsFlower);
        }
    }
});
Bride.create = function (position) {
    var bride = new Bride();
    bride.initWithFile(s_bridePNG);
    bride.initBody(position);
    return bride;
};

var RopePointer = cc.Class.extend({
    _pointerBody:null,
    _pointerShape:null,

    init:function (position, groupId) {
        this._pointerBody = space.addBody(new cp.Body(0.1, cp.momentForCircle(0.5, 0, 5, cp.v(0, 0))));
        this._pointerBody.setPos(cp.v(position.x, position.y));
        this._pointerShape = new cp.CircleShape(this._pointerBody, 5, cp.v(0, 0));
        space.addShape(this._pointerShape);
        this._pointerShape.setFriction(0.7);
        this._pointerShape.group = groupId;
        this._pointerShape.setCollisionType(COLROPEPOINTER);
    },

    getBody:function () {
        return this._pointerBody;
    },

    getShape:function () {
        return this._pointerShape;
    },

    removePointer:function () {
        if (this._pointerBody) {
            space.removeBody(this._pointerBody);
            this._pointerBody = null;
        }
        if (this._pointerShape) {
            space.removeShape(this._pointerShape);
            this._pointerShape = null;
        }
    }
});

RopePointer.create = function (position, groupId) {
    var pointer = new RopePointer();
    pointer.init(position, groupId);
    return pointer;
};

var RopeJointer = cc.Class.extend({
    _jointer:null,

    init:function (body1, body2, body1Offset, body2Offset, maxLength) {
        this._jointer = new cp.SlideJoint(body1, body2, body1Offset, body2Offset, 0, maxLength);
        //this._jointer.maxForce = 100000;
        space.addConstraint(this._jointer);
    },

    getJoint:function () {
        return this._jointer;
    },

    removeJointer:function () {
        if (this._jointer) {
            space.removeConstraint(this._jointer);
            this._jointer = null;
        }
    }
});

RopeJointer.create = function (body1, body2, body1Offset, body2Offset, maxLength) {
    var jointer = new RopeJointer();
    jointer.init(body1, body2, body1Offset, body2Offset, maxLength);
    return jointer;
};

var Player = Actor.extend({
    _ropeArray:null,
    _ropeEndPointer:null,
    _ropeBeginPointer:null,
    _bagShape:null,
    _bagBody:null,
    _backgroundLayer:null,
    ropeLength:200,
    _willThrowSpriteFrames:null,
    _throwingSpriteFrames:null,

    ctor:function () {
        this._super();
        this._ropeArray = [];

        var vallainTexture = cc.TextureCache.getInstance().addImage(s_vallainPNG);

        this._willThrowSpriteFrames = [];
        this._willThrowSpriteFrames.push(cc.SpriteFrame.createWithTexture(vallainTexture, cc.rect(0, 0, 78, 92)));
        this._willThrowSpriteFrames.push(cc.SpriteFrame.createWithTexture(vallainTexture, cc.rect(80, 0, 78, 92)));

        this._throwingSpriteFrames = [];
        this._throwingSpriteFrames.push(cc.SpriteFrame.createWithTexture(vallainTexture, cc.rect(158, 0, 85, 92)));
        this._throwingSpriteFrames.push(cc.SpriteFrame.createWithTexture(vallainTexture, cc.rect(243, 0, 85, 92)));
    },

    onEnter:function () {
        this._super();
        this.willThrowBag();
    },

    setBackgroundLayer:function (layer) {
        this._backgroundLayer = layer;
    },

    willThrowBag:function () {
        this.stopAllActions();
        var animation = cc.Animation.create(this._willThrowSpriteFrames, 0.25);
        var animate = cc.Animate.create(animation);
        this.runAction(cc.RepeatForever.create(animate));
    },

    retrievingBag:function () {
        this.stopAllActions();
        var animation = cc.Animation.create(this._throwingSpriteFrames, 0.6);
        var animate = cc.Animate.create(animation);
        this.runAction(cc.RepeatForever.create(animate));
    },

    initBody:function (position) {
        var selSize = this.getContentSize();
        this._actorBody = new cp.StaticBody();
        this._actorBody.setPos(cp.v(position.x, position.y));
        var playerShape = new cp.BoxShape(this._actorBody, selSize.width, selSize.height);
        playerShape.setFriction(1);
        playerShape.setElasticity(0.5);
        playerShape.setCollisionType(COLPLAYER);
        playerShape._node = this;
        playerShape.setSensor(true);
        space.addShape(playerShape);
        this.setBody(this._actorBody);
    },

    bagRemoved:function () {
        this._bagShape = null;
        this._bagBody = null;
        this._backgroundLayer.removeChild(this._bagSprite, true);
        this._bagSprite = null;
    },

    throwBag:function (impulse) {
        this.stopAllActions();

        var playerSize = this.getContentSize();

        this._bagSprite = cc.PhysicsSprite.create(s_throwbagPNG);
        this._bagBody = space.addBody(new cp.Body(1, cp.momentForBox(1, 30, 30)));
        this._bagBody.setPos(cp.v(this.getPosition().x, this.getPosition().y));
        this._bagBody.setAngle(Math.PI);
        this._bagBody.node = this._bagSprite;

        this._bagShape = new cp.BoxShape(this._bagBody, 30, 30);
        space.addShape(this._bagShape);
        this._bagShape.setFriction(0.7);
        this._bagShape.collision_type = COLBAG;
        this._bagShape.group = 101;

        this._ropeBeginPointer = RopePointer.create(this.getPosition(), 101);
        this._ropeEndPointer = RopePointer.create(this.getPosition(), 101);

        this._ropeArray.push(RopeJointer.create(player._actorBody, this._ropeBeginPointer.getBody(), cp.v(playerSize.width / 2, 0), cp.v(0, 0), player.ropeLength));
        this._ropeArray.push(RopeJointer.create(this._ropeBeginPointer.getBody(), this._ropeEndPointer.getBody(), cp.v(0, 0), cp.v(0, 0), player.ropeLength));
        this._ropeArray.push(RopeJointer.create(this._ropeEndPointer.getBody(), this._bagBody, cp.v(0, 0), cp.v(15, 0), player.ropeLength));

        this._bagBody.applyImpulse(impulse, cp.v((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5));

        this._bagSprite.setBody(this._bagBody);
        this._backgroundLayer.addChild(this._bagSprite);
        this.unschedule(this._cameraAllowBag);
        if(!this._backgroundLayer.isMenu)
        {
            console.log("notmenu");
            this.getScheduler().scheduleCallbackForTarget(this, this._cameraAllowBag, 0, cc.REPEAT_FOREVER, 0.0, false);
        }

        // do throw animation
        this.setDisplayFrame(this._throwingSpriteFrames[0]);

        cc.AudioEngine.getInstance().playEffect(s_throwMP3);

        return this._bagShape;
    },

    _cameraAllowBag:function (dt) {
        if (this._ropeArray == null || this._ropeArray.length != 3 || !this._backgroundLayer) {
            this.unschedule(this._cameraAllowBag);
            return;
        }

        var endBody = this._ropeArray[2].getJoint().b;
        if (endBody.isSleeping() || endBody.nodeIdleTime > 2) {
            if(!player.gotBride)
            {
                this.unschedule(this._cameraAllowBag);
                //reset camera
                if(this._backgroundLayer.resetCamera)
                this._backgroundLayer.resetCamera();
                this.stopAllActions();
                this.willThrowBag();
                this._removeOldBag();
            }
            else{
                console.log("i got the bride");
            }
            return;
        }

        var winSize = cc.Director.getInstance().getWinSize();
        var moveX = (winSize.width / 2 - endBody.p.x);
        var moveY = (winSize.height / 2 - endBody.p.y);
        var oldX = this._backgroundLayer.getPositionX();
        var oldY = this._backgroundLayer.getPositionY();
        moveX = (moveX - oldX) * 2 * dt + oldX;
        moveY = (moveY - oldY) * 2 * dt + oldY;
        if (moveX > 0)
            moveX = 0;
        //this._backgroundLayer.setPosition(moveX, this._backgroundLayer.getPositionY());
        this._backgroundLayer.setPosition(moveX, moveY);

    },

    _removeOldBag:function () {
        if (this._ropeArray == null || this._ropeArray.length == 0)
            return;

        for (var i = 0; i < this._ropeArray.length; i++)
            this._ropeArray[i].removeJointer();

        this._ropeBeginPointer.removePointer();
        this._ropeEndPointer.removePointer();

        if (this._bagBody) {
            space.removeBody(this._bagBody);
            this._bagBody = null;
        }
        if (this._bagShape) {
            space.removeShape(this._bagShape);
            this._bagShape = null;
        }
        if (this._bagSprite) {
            this._backgroundLayer.removeChild(this._bagSprite, true);
            this._bagSprite = null;
        }
        this._ropeArray.length = 0;

    },

    popRopeArray:function () {
        this._ropeArray.pop();
    },

    pushRopeArray:function (jointer) {
        this._ropeArray.push(jointer);
    },

    getRopeEndPointer:function () {
        return this._ropeEndPointer;
    },

    _pullTime:0,
    pull:function () {
        this.getScheduler().scheduleCallbackForTarget(this, this._computeRopeLength, 0.2, 1, 0.6, false);
        this.getScheduler().scheduleCallbackForTarget(this, this._pullRope, 0.2, cc.REPEAT_FOREVER, 0.6, false);
        this.retrievingBag();
    },

    _computeRopeLength:function (dt) {
        var beginJoint = this._ropeArray[0].getJoint();
        var endJoint = this._ropeArray[2].getJoint();

        var dist = cc.pLength(cc.p(beginJoint.a.p.x + beginJoint.anchr1.x, beginJoint.a.p.y + beginJoint.anchr1.y),
            cc.p(endJoint.b.p.x + endJoint.anchr2.x, endJoint.b.p.y + endJoint.anchr2.y)) + 20;

        for (var i = 0; i < this._ropeArray.length; i++) {
            this._ropeArray[i].getJoint().max = dist / this._ropeArray.length;
        }

        this._ropeBeginPointer.getBody().setMass(1);
        this._ropeBeginPointer.getBody().setMoment(cp.momentForCircle(1, 0, 5, cp.v(0, 0)));
        this._ropeEndPointer.getBody().setMass(1);
        this._ropeEndPointer.getBody().setMoment(cp.momentForCircle(1, 0, 5, cp.v(0, 0)));
    },

    _pullRope:function (dt) {
        this._pullTime++;
        if (this._pullTime == 3) {
            this._pullTime = 0;
            var getRopeJointer = this._getAvalidateRope();
            if (getRopeJointer) {
                cc.AudioEngine.getInstance().playEffect(s_pullMP3);
                getRopeJointer.max -= 70;
                if(this._backgroundLayer.isMenu)
                {
                    getRopeJointer.max -= 70;
                    console.log("speed up");
                }
                if (getRopeJointer.max < 0)
                    getRopeJointer.max = 0;
            } else {
                this.unschedule(this._pullRope);
            }
        }
    },

    _getAvalidateRope:function () {
        for (var i = 0; i < this._ropeArray.length; i++) {
            if (this._ropeArray[i].getJoint().max > 0)
                return this._ropeArray[i].getJoint();
        }
        return null;
    },

    getBezierControlPoints:function () {
        if (this._ropeArray == null || this._ropeArray.length != 3)
            return null;

        var retArr = [];
        var selJoint = this._ropeArray[0].getJoint();
        var anchr = selJoint.a.local2World(selJoint.anchr1);
        retArr.push(cc.p(anchr.x, anchr.y));
        selJoint = this._ropeArray[1].getJoint();
        anchr = selJoint.a.local2World(selJoint.anchr1);
        retArr.push(cc.p(anchr.x, anchr.y));
        selJoint = this._ropeArray[2].getJoint();
        anchr = selJoint.a.local2World(selJoint.anchr1);
        retArr.push(cc.p(anchr.x, anchr.y));
        anchr = selJoint.b.local2World(selJoint.anchr2);
        retArr.push(cc.p(anchr.x, anchr.y));

        return retArr;
    },

    catchActor:function (phySprite) {
        for (var i = bagShapes.length; i >= 0; i--) {
            if (bagShapes[i] && bagShapes[i].toRmove) {
                var shape = bagShapes[i];
                var body = shape.body;
                body.eachConstraint(function (c) {
                    space.removeConstraint(c)
                });
                space.removeShape(shape);
                space.removeBody(body);
                bagShapes.splice(i, 1);
            }
        }

        player.popRopeArray();
        //after we removed the bag and the rope, we will addd a new rope to the bride
        player.pushRopeArray(RopeJointer.create(player.getRopeEndPointer().getBody(), phySprite.getBody(), cp.v(0, 0), cp.v(0, -22), 200))
        player.pull();
    },

    catchedActor:function(){
        this.stopAllActions();
        this.unschedule(this._cameraAllowBag);
        this.willThrowBag();
        var playerSize = this.getContentSize();
        this._ropeArray[0].getJoint().anchr1 = cp.v(-playerSize.width/2,25);
    }
});
Player.create = function (position) {
    var player = new Player();
    player.initWithFile(s_vallainPNG, cc.rect(0, 0, 68, 92));
    player.initBody(position);
    return player;
};

var Guest = Actor.extend({

});