
var Item = cc.Class.extend({
    ctor:function(img, pos, weight, polies, friction, elastic){
        friction = friction || 1;
        elastic = elastic || 0;
        weight = weight || 1;
        this.sprite = cc.PhysicsSprite.create(img);
        this.body = new cp.Body(weight, cp.momentForPoly(weight, polies, cp.v(0,0)));
        this.shape = new cp.PolyShape(this.body, polies, cp.v(0,0));
        this.body.setPos(pos);
        this.sprite.setBody(this.body);
        this.shape.setFriction(friction);
        this.shape.setElasticity(elastic);
        this.shape.setCollisionType(COLITEM);
    },
    addTo:function(p){
        p.addChild(this.sprite);
        space.addShape(this.shape);
        space.addBody(this.body);
    }
});

var items = {
    pillar:{
        img:s_pillarPNG,
        polies:[-20,64,20,64,20,-64, -20,-64]
    },
    chair:{
        img:s_chairPNG,
        polies:[-22,32, 22,-8, 22,-32,-22,-32]
    },
    table:{
        img:s_tablePNG,
        polies:[-64,12, -28,24, 28,24, 64,12, 48,-20, -48,-20]
    },
    cake:{
        img:s_cakePNG,
        polies:[-28,26, 28,26, 64,-18,  48,-46,  -48,-46, -64,-18 ]
    },
    arch:{
        img:s_archPNG,
        polies:[-12,44, 12,60, 20,-60, -12,-60]
    },
    pot:{
        img:s_potPNG,
        polies:[-11,18, 11,18, 18,-48, -18,-48]
    }
};