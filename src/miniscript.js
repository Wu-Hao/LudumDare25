var menuScript = [
    {actor:"priest", script:"JANE"},
    {actor:"priest", script:"Wilt thou have this Man to thy wedded husband"},
    {actor:"priest", script:"Wilt thou love him, comfort him,"},
    {actor:"priest", script:"Blah blah blah blah..."},
    {actor:"bride", script:"I ..."}
];

var PriestScript = [
    {actor:"priest", script:"Dearly beloved"},
    {actor:"priest", script:"We are gathered here today"},
    {actor:"priest", script:"to join this man and this woman in holy matriomony"},
    {actor:"priest", script:"Do either of you have any reason why you should not legally be joined in marriage?"},
    {actor:"priest", script:"By the power vested in me by the laws of pixel land"},
    {actor:"priest", script:"I now pronounce you"},
    {actor:"priest", script:"husband and wife. you may kiss the bride now"}

];

var MiniScript = cc.Class.extend({
    index:0,
    ctor:function(script,bride,groom,priest){
        this.script = script;
        this.bride = bride;
        this.groom = groom;
        this.priest = priest;
    },
    next:function(){
        if(MiniScript.timer)
        {
            clearTimeout(MiniScript.timer);
        }
        if(this.index >= this.script.length)
        {
            return;
        }
        var actor;
        switch(this.script[this.index].actor)
        {
            case "priest":
                actor = this.priest;
                break;
            case "player":
                actor = player;
                break;
            case "bride":
                actor = this.bride;
                break;
            case "groom":
                actor = this.groom;
                break;
        }
        if(actor)
        actor.runScript(this.script[this.index]["script"], this);
        this.index++;
    }
});