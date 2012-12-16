/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var gameScene = cc.Scene.extend({
    debugNode:null,
    level:null,
    physicsTimer:null,
    mouseStart:null,
    mapsIndex:0,
    maps:[s_level0, s_level1, s_testMap, s_level3, s_level2],
    ctor:function () {
        this.level = new Level(this.maps[this.mapsIndex]);


        this.setupLevel();

    },
    gotoMenu:function(){
        this.removeChild(this.level, true);
        this.level = null;
        //this.level = new Level(this.maps[this.mapsIndex]);
        cc.Director.getInstance().replaceScene(new MainMenu);
    },
    setupLevel:function(){
        /*        window.space = new cp.Space();
         space.iterations = 20;
         space.gravity = cp.v(0, -GRAVITY);
         space.sleepTimeThreshold = 1.2;*/
        var reset = cc.MenuItemImage.create(s_reset, s_reset,this.reset.bind(this));
        //var mainmenu = cc.MenuItemImage.create(s_menu, s_menu, this.gotoMenu.bind(this));
        this.menu = cc.Menu.create(reset);
        this.addChild(this.menu, 9);
        reset.setPosition(cc.p(430,200));
        //mainmenu.setPosition(cc.p(-430,200));
        if(!window.physicsTimer)
            window.physicsTimer = setInterval(function () {
                space.step(1 / 60);
            }, 1000 / 60);


        this.addChild(this.level);

        space.addCollisionHandler(COLBRIDE, COLBAG, null, this.checkCatch.bind(this));
        space.addCollisionHandler(COLBRIDE, COLPLAYER, this.win.bind(this));
        space.addCollisionHandler(COLROPEPOINTER, COLBRIDE, function () {
            return false;
        });
        space.addCollisionHandler(COLROPEPOINTER, COLBAG, function () {
            return false;
        });
        space.addCollisionHandler(COLROPEPOINTER, COLGROOM, function () {
            return false;
        });
        space.addCollisionHandler(COLROPEPOINTER, COLPLAYER, function () {
            return false;
        });
        space.addCollisionHandler(COLROPEPOINTER, COLITEM, function () {
            return false;
        });
        space.addCollisionHandler(COLBAG, 0, function () {
            cc.AudioEngine.getInstance().playEffect(s_baglandMP3);
            return true;
        });

        /*        space.addCollisionHandler(COLITEM, COLITEM, function () {
         cc.AudioEngine.getInstance().playEffect(s_objecthitMP3);
         return true;
         });*/
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
    win:function () {
        if (!isGameWon) {
            cc.AudioEngine.getInstance().playEffect(s_victoryMP3);
            player.catchedActor();
            isGameWon = true;

            //next please
            var next = cc.MenuItemImage.create(s_next,s_next, this.nextLevel.bind(this));
            next.setPositionY(100);
            this.nextButton = next;
            this.menu.addChild(next);
        }
    },
    nextLevel:function(){
        console.log(this.mapsIndex);
        if(this.mapsIndex >= this.maps.length-1)
        {
            alert("You got all the brides!");
            console.log("I wish I have more time");
            //cc.Director.getInstance().replaceScene(new MainMenu);
        }
        else{
            this.mapsIndex++;
            this.menu.removeChild(this.nextButton,true);
            this.reset();
            window.isGameWon = false;
            player.gotBride = false;
        }
        console.log("next");
    },
    reset:function(){
        this.removeChild(this.level, true);
        this.level = null;
        this.level = new Level(this.maps[this.mapsIndex]);
        this.setupLevel();
    }
});

var isGameWon = false;
