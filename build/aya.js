(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.aya = {}));
})(this, (function (exports) { 'use strict';

	var store = {};

	class _Register
	{
	    static add(object) {
	        store[object.uuid] = object;
	    }

	    static find(uuid){
	        return store[uuid];
	    }

	    static clear(uuid){
	        delete store[uuid];
	    }
	    
	    static getAllLinksByComponent(component){
	        var result = [];
	        Object.keys(store).map((id) => {
	            var obj = _Register.find(id);
	            if(obj.type == "link"){
	                if(component.uuid == obj.source.ref || component.uuid == obj.destination.ref)
	                    result.push(obj);
	            }
	        });
	        return result;
	    }
	}

	class _uuid
	{

	    static generate()
	    {
	        return Math.random().toString(36).substring(2, 15) +
	        Math.random().toString(36).substring(2, 15);
	    }
	}

	/**
	 * @class EventManager
	 */
	 class EventManager
	 {
	      constructor(){
	  
	          this.events = [];
	      }
	  
	      add(target, event, callback){
	          this.events.push([target, event, callback]);
	      }
	  
	      clear(){
	          this.destroy();
	          this.events = [];
	      }
	  
	      destroy(){
	          for(var i = 0; i < this.events.length; i++)
	          {
	              var event = this.events[i];
	              event[0].removeEventListener(event[1], event[2]);
	          }
	      }
	  
	      create(){
	          for(var i = 0; i < this.events.length; i++)
	          {
	              var event = this.events[i];
	              event[0].addEventListener(event[1], event[2]);
	          }
	      }
	 }

	/**
	 *
	 * @class Point
	 * @param {number} x
	 * @param {number} y
	 *
	 */

	class Point {
	  constructor(uuid, x = 0, y = 0, r = 3) {

	    this.ref = uuid;
	    this.uuid = _uuid.generate();

	    this.x = x;
	    this.y = y;
	    this.r = r;

	    this.c_svg = "";

	    _Register.add(this);
	  }

	  draw(svgs) {
	    var ns = "http://www.w3.org/2000/svg";

	    this.c_svg = document.createElementNS(ns, "circle");

	    this.c_svg.setAttribute("cx", this.x);

	    this.c_svg.setAttribute("cy", this.y);

	    this.c_svg.setAttribute("r", this.r);

	    // this.c_svg.setAttribute("class", "vertex");

	    this.c_svg.setAttribute("id", this.uuid);
	    this.c_svg.addEventListener("mousedown", events.mouseDownCb);
	    //this.c_svg.addEventListener("mousemove", events.mouseMoveCb);
	    this.c_svg.addEventListener("mouseup", events.mouseUpCb);

	    svgs.appendChild(this.c_svg);

	  }

	  shift(dx, dy) {
	    this.x += dx;
	    this.y += dy;
	  }

	  redraw() {

	    this.c_svg.setAttribute("cx", this.x);
	    this.c_svg.setAttribute("cy", this.y);
	    
	  }
	}

	/**
	 * @class Line
	 */

	class Line 
	{
	    /**
	     * 
	     * @param {string} uuid 
	     * @param {number} x 
	     * @param {number} y 
	     * @param {number} dest_x 
	     * @param {number} dest_y 
	     * @param {array of object} children 
	     * @param {object} ratio 
	     */

	    constructor(uuid, x=0, y=0, dest_x = x, dest_y = y, children = [], ratio = {}){

	        this.uuid = uuid;

	        this.x = x;
	        this.y = y;
	        
	        this.dest_x = dest_x;
	        this.dest_y = dest_y;

	        this.events = new EventManager();

	        //points d'inflexion

	        // this.c0 = { x : this.x, y : this.y};
	        this.c1 = { x : this.x, y : this.y};
	        this.c2 = { x : this.x, y : this.y};
	        // this.c3 = { x : this.x, y : this.y};

	        this.c_svg = "";
	        this.type = "line";

	        this.ratio = ratio;
	        this.children = [];

	        this.a = (this.dest_y - this.y) / (this.dest_x - this.x);
	        this.b = this.y - this.a * this.x;
	        this.m = -1/this.a;

	        this.vertex = [
	            new Point(this.uuid, 0, 0),
	            new Point(this.uuid, 0, 0),
	        ];

	        this.createChildren(children);
	    }

	    drawVertex(){
	        this.vertex[0].x = this.x;
	        this.vertex[0].y = this.y;

	        this.vertex[1].x = this.dest_x;
	        this.vertex[1].y = this.dest_y;
	    }

	    draw(svgs){

	        const ns = "http://www.w3.org/2000/svg";
	        this.c_svg = document.createElementNS(ns,'path');

	        var p = "M "+  this.x + ","+ this.y + " "+  " L" + this.c1.x + "," + this.c1.y + "  L" + this.c2.x + "," + this.c2.y + "  L" + this.dest_x  + "," + this.dest_y;

	        this.c_svg.setAttribute("id", this.uuid);
	        this.c_svg.setAttribute("d", p);
	        this.c_svg.setAttribute("fill", "none");
	        this.c_svg.setAttribute("stroke", "indigo");
	        this.c_svg.setAttributeNS(null, "stroke-width", "2px");

	        svgs.appendChild(this.c_svg);

	        this.drawVertex();

	        this.vertex.map( (vertex) => {
	            vertex.draw(svgs);
	        });

	        this.children.map((child) => {
	            child.draw(svgs);
	        });

	        this.events.add(this.c_svg, "mousedown", events.mouseDownCb);

	        this.events.create();
	    }

	    shift(dx,dy){
	        this.x += dx;
	        this.y += dy;
	        this.c1.x += dx;
	        this.c1.y += dy;
	        this.c2.x += dx;
	        this.c2.y += dy;
	        this.dest_x += dx;
	        this.dest_y += dy;
	    }

	    redraw(){

	       
	        this.drawVertex();
	        this.vertex.map( (vertex) => {
	            vertex.redraw();
	        });

	        this.children.map( (child) => {
	            child.redraw();
	        });

	        if(this.y == this.c1.y && this.dest_y == this.c2.y);
	        var p = "M "+  this.x + ","+ this.y + " "+  " L" + this.c1.x + "," + this.c1.y + "  L" + this.c2.x + "," + this.c2.y + "  L" + this.dest_x  + "," + this.dest_y;
	        this.c_svg.setAttribute("d", p);
	    }

	    resize(pos, dx, dy, param = {}){


	        // if(Object.keys(param).length > 0){
	            this.children.map( (child) => {
	                child.resize(pos, dx, dy, {x: this.x, y: this.y, dest_x: this.dest_x, dest_y: this.dest_y, a: this.a, m: this.m, c: this.c});
	            });
	        // }

	        if(pos == 0){
	            this.x += dx;
	            this.y += dy;
	            this.c1.x += dx;
	            this.c1.y += dy;
	            this.c2.x += dx;
	            this.c2.y += dy;
	        }
	        else {
	            this.dest_x += dx;
	            this.dest_y += dy;
	        }
	    }


	    createChildren(children){
	        children.map((chd) => {
	            if(chd.type == "triangle" && chd.ratio.end == true){
	                this.c = this.dest_y - this.m * this.dest_x;
	                var _x1, _y1, _x2, _y2, _x3, _y3;
	                if(this.a == 0){
	                    console.log("this.a == 0");
	                    _x1 = this.dest_x;
	                    _y1 = this.dest_y - 5;
	                    
	                    _x2 = this.dest_x + 10;
	                    _y2 = this.dest_y;

	                    _x3 = _x1;
	                    _y3 = _y1 + 10;
	                }
	                else {
	                    console.log("this.a != 0");
	                    _x1 = this.m < 0 ? this.dest_x - 3 : this.dest_x + 3;
	                    _y1 = this.m * _x1 + this.c;
	    
	                    _x2 = this.dest_x + 10;
	                    _y2 = this.a * _x2 + this.b;
	    
	                    _x3 = this.m < 0 ? this.dest_x + 3 : this.dest_x - 3;
	                    _y3 = this.m * _x3 + this.c;
	                }

	                

	                var child = FactoryForm.createForm(this.uuid, chd.type, {x1: _x1, y1: _y1, x2: _x2, y2: _y2, x3: _x3, y3: _y3}, [], chd.ratio, chd.zoom);
	                this.children.push(child);
	            }
	            else if(chd.type == "triangle" && chd.ratio.start == true){
	                this.c = this.y - this.m * this.x;
	                var _x1, _y1, _x2, _y2, _x3, _y3;
	                if(this.a == 0){
	                    console.log("this.a == 0");
	                    _x1 = this.x;
	                    _y1 = this.y - 5;
	                    
	                    _x2 = this.x - 10;
	                    _y2 = this.y;

	                    _x3 = _x1;
	                    _y3 = _y1 + 10;
	                }
	                else {
	                    console.log("this.a != 0");
	                    _x1 = this.m < 0 ? this.x - 3 : this.x + 3;
	                    _y1 = this.m * _x1 + this.c;
	    
	                    _x3 = this.m < 0 ? this.x + 3 : this.x - 3;
	                    _y3 = this.m * _x3 + this.c;

	                    _x2 = this.x - 10;
	                    _y2 = this.a * _x2 + this.b;
	                }

	                var child = FactoryForm.createForm(this.uuid, chd.type, {x1: _x1, y1: _y1, x2: _x2, y2: _y2, x3: _x3, y3: _y3}, [], chd.ratio, chd.zoom);
	                this.children.push(child);
	            }
	        });
	    }
	}
	 




	/**
	 *      // var p = _Register.find(this.parent);

	        // if(Object.keys(param).length > 0){
	        //     if( pos == 0){
	        //         var c_p = p.form.c_points[pos];
	    
	        //         // vertical line
	        //         if( this.x == this.dest_x && this.y != this.dest_y){
	        //             if( (this.y - c_p.y) <   (this.dest_y - c_p.y)){
	        //                 this.y += dy;
	        //             }
	        //             else{
	        //                 this.dest_y += -dy;
	        //             }
	        //         }
	    
	        //         // horizontal line
	        //         else if( this.y == this.dest_y && this.x != this.dest_x){
	        //             if(  (this.x - c_p.x) <   (this.dest_x - c_p.x)  ){
	    
	        //                 this.x += dx;
	        //             }
	        //             else{
	        //                 this.dest_x += dx;
	        //             }
	        //         }
	        //         else{
	    
	        //         }
	    
	        //     }
	        //     else if(pos == 1){
	        //         var c_p = p.form.c_points[pos];
	    
	        //         // vertical line
	        //         if( this.x == this.dest_x && this.y != this.dest_y){
	        //             if(  ( this.y - c_p.y  ) <= ( this.dest_y - c_p.y) ){
	        //                 this.y += dy;
	        //             }
	        //             else{
	        //                 this.dest_y += -dy;
	        //             }
	        //         }
	        //         // horizontal line
	        //         else if( this.y == this.dest_y && this.x != this.dest_x){
	        //             if( ( c_p.x - this.x) <= ( c_p.x - this.dest_x) ){
	    
	        //                 this.x += dx;
	        //             }
	        //             else{
	        //                 this.dest_x += dx;
	        //             }
	        //         }
	        //         else{
	    
	        //         }
	    
	        //     }
	        //     else if(pos == 2){
	        //         var c_p = p.form.c_points[pos];
	    
	        //         // vertical line
	        //         if( this.x == this.dest_x && this.y != this.dest_y){
	        //             if(  ( c_p.y - this.y ) <= ( c_p.y - this.dest_y ) ){
	        //                 this.y += dy;
	        //             }
	        //             else{
	        //                 this.dest_y += dy;
	        //             }
	        //         }
	        //         // horizontal line
	        //         else if( this.y == this.dest_y && this.x != this.dest_x){
	        //             if( ( c_p.x - this.x) <= ( c_p.x - this.dest_x) ){
	    
	        //                 this.x += dx;
	        //             }
	        //             else{
	        //                 this.dest_x += dx;
	        //             }
	        //         }
	        //         else{
	    
	        //         }
	    
	        //     }
	        //     else if(pos == 3){
	        //         var c_p = p.form.c_points[pos];
	    
	        //         // vertical line
	        //         if( this.x == this.dest_x && this.y != this.dest_y){
	        //             if(  ( c_p.y - this.y ) <= ( c_p.y - this.dest_y ) ){
	        //                 this.y += dy;
	        //             }
	        //             else{
	        //                 this.dest_y += dy;
	        //             }
	        //         }
	        //         // horizontal line
	        //         else if( this.y == this.dest_y && this.x != this.dest_x){
	        //             if( ( this.x - c_p.x ) <= ( this.dest_x - c_p.x) ){
	    
	        //                 this.x += dx;
	        //             }
	        //             else{
	        //                 this.dest_x += dx;
	        //             }
	        //         }
	        //         else{
	    
	        //         }
	        //     }
	        // }

	 */

	/**
	 * @class Link
	 */

	class Link
	{
	    constructor(source, destination, line = undefined)
	    {
	       this.uuid = _uuid.generate();
	       /* référence sur les points de connexions*/
	       this.source = source;
	       this.destination = destination;
	       this.line = line;
	       this.type = "link";
	       _Register.add(this);
	    }

	    redraw(){
	        var source = _Register.find(this.source.ref), destination = _Register.find(this.destination.ref);

	        var source_point = source.form.optimalPath(this.line);
	        var dest_point = destination.form.optimalPath(this.line);


	        if(source_point)
	            this.source = source_point;
	        if(dest_point)
	            this.destination = dest_point;

	        this.line.x = this.source.x;
	        this.line.y = this.source.y;

	        this.line.dest_x = this.destination.x;
	        this.line.dest_y = this.destination.y;

	        // console.log("c1");
	        // console.log(this.line.c1);


	        // console.log("c2");
	        // console.log(this.line.c2);

	        // if(this.source.x != this.line.c1.x && this.destination.y == this.line.c2.y){
	        //     console.log("test 1");
	        //     // this.line.c0.x = this.source.x;
	        //     // this.line.c0.y = (this.destination.y - this.source.y) / 2;
	        //     // this.line.c3.x = this.destination.x;
	        //     // this.line.c3.y = this.line.c1.y;
	            
	        //     this.line.redraw();
	        // }
	        // if(this.source.y == this.line.c1.y && this.destination.y != this.line.c2.y){
	        //     console.log("test 2");
	        //     this.line.c1.x = this.source.x;
	        //     this.line.c1.y = this.line.c2.y;
	        //     this.line.redraw();
	        // }
	        // if(this.source.y != this.line.c1.y && this.destination.y == this.line.c2.y){
	        //     console.log("test 3");
	        //     this.line.c2.x = this.destination.x;
	        //     this.line.c2.y = this.line.c1.y;
	        //     this.line.redraw();
	        // }

	         // var delta_x, delta_y, c1 = {x : 0, y: 0}, c2 = {x : 0, y: 0};

	        // delta_x = (this.x > this.dest_x) ? this.x - this.dest_x :  -(this.x - this.dest_x);
	        // delta_y = (this.y > this.dest_y) ? this.y - this.dest_y :  -(this.y - this.dest_y);
	        

	        // delta_x /= 2;
	        // c1.x = (this.x < this.dest_x) ? this.x + delta_x : this.x - delta_x;
	        // c1.y = this.y;

	        // c2.x = (this.dest_x < this.x) ? this.dest_x + delta_x : this.dest_x - delta_x;
	        // c2.y = this.dest_y;

	        // this.c1 = c1;
	        // this.c2 = c2;
	        
	        this.line.redraw();

	    }

	}



	/***
	 *
	 *         // var pt = this.source.determine_the_right_point(this.line);


	 *         var delta_x, delta_y, c1 = {x : 0, y: 0}, c2 = {x : 0, y: 0};

	        delta_x = (this.line.x > this.line.dest_x) ? this.line.x - this.line.dest_x :  -(this.line.x - this.line.dest_x);
	        delta_y = (this.line.y > this.line.dest_y) ? this.line.y - this.line.dest_y :  -(this.line.y - this.line.dest_y);

	        console.log("delta_x,delta_y")
	        console.log(delta_x,delta_y)
	        console.log("this.line")
	        console.log(this.line)

	        // c1.x = (this.line.x > this.line.dest_x) ? this.line.x - delta_x/2 : this.line.x + delta_x/2;
	        // c1.y = (this.line.y > this.line.dest_y) ? this.line.y  : this.line.dest_y;

	        // c2.x = c1.x;
	        // c2.y = -delta_y + c1.y;

	        delta_x /= 2;
	        c1.x = (this.line.x < this.line.dest_x) ? this.line.x + delta_x : this.line.x - delta_x;
	        c1.y = this.line.y;

	        c2.x = (this.line.dest_x < this.line.x) ? this.line.dest_x + delta_x : this.line.dest_x - delta_x;
	        c2.y = this.line.dest_y;

	        console.log('c1')
	        console.log(c1)
	        console.log('c2')
	        console.log(c2)

	        this.line.c1 = c1;
	        this.line.c2 = c2;

	 */

	function nativeEvents() {
	  var id;
	  var cp;
	  var dx, dy;
	  var state = "";
	  var deltaX, deltaY;
	  var line = "";
	  var source;
	  var lk;
	  var pos;

	  return {
	    mouseDownCb: function mousedowncb(e) {

	      dx = e.offsetX;
	      dy = e.offsetY;

	      id = e.srcElement.id;

	      cp = _Register.find(id);
	      console.log(cp);

	      if (id != "svg")
	        source = cp != undefined && cp.ref != undefined ? _Register.find(cp.ref) : cp;

	      if(cp.form != undefined)
	        lk = _Register.getAllLinksByComponent(cp);


	      // une forme différente de Point n'a pas de propriété ref
	      if ((cp != undefined && cp.ref == undefined) )
	          state = "moving";
	      else {
	        if (  (source.form.vertex != undefined) && (pos = source.form.vertex.indexOf(cp)) >= 0) {
	          state = "resizing";
	          dx = e.offsetX;
	          dy = e.offsetY;

	          /* détermination du composant */
	          cp = _Register.find(cp.ref);
	          lk = _Register.getAllLinksByComponent(cp);
	        }
	        else {
	          state = "drawing_link";
	          id = _uuid.generate();
	          if (cp != source) {
	            line = new Line(id, cp.x, cp.y);
	            line.draw(svg);
	          }
	        }
	      }
	    },
	    mouseMoveCb: function movecb(e) {

	      if (state == "moving") {

	        deltaX = e.offsetX - dx;
	        deltaY = e.offsetY - dy;

	        dx = e.offsetX;
	        dy = e.offsetY;

	        /* test si cp est un compsant*/
	        var src;
	        if(cp.form != undefined){
	          lk.map((link) => {
	            cp.form.c_points.map( (point) => {

	              if(point == link.source)
	                src = point;
	              else if(point == link.destination)
	                ;
	            });
	            if(src){
	              link.line.x += deltaX;
	              link.line.y += deltaY;
	              link.line.redraw();
	            }
	            else {
	              link.line.dest_x += deltaX;
	              link.line.dest_y += deltaY;
	              link.line.redraw();
	            }
	          });


	          /*  à revoir */

	          cp.form.children.map( (child) => {
	            if(child.type == "line"){
	              child.shift(deltaX, deltaY);
	              child.dest_x += deltaX;
	              child.dest_y += deltaY;
	              child.redraw();
	            }
	            else {
	              child.shift(deltaX, deltaY);
	              child.redraw();
	            }
	          });


	          cp.form.shift(deltaX, deltaY);
	          cp.form.redraw();

	          lk.map( (link) => {
	            link.redraw();
	          });

	        }

	        // il s'agit d'une form pas d'une instance de la classe Component ou de Point
	        if(cp.form  == undefined && cp.ref == undefined){

	          if(cp.type == "line"){
	            cp.shift(deltaX, deltaY);

	            cp.dest_x += deltaX;
	            cp.dest_y += deltaY;

	            cp.redraw();
	          }
	          else {
	            cp.shift(deltaX, deltaY);
	            cp.redraw();
	          }
	        }
	      }
	      else if (state == "drawing_link") {

	        source.form.vertex.map((v) => {
	          if (v.x == line.x && v.y == line.y) {
	            v.c_svg.classList.remove("vertex");
	            v.c_svg.classList.add("vertex_hover");
	          }
	        });

	        source.form.c_points.map((v) => {
	          if (v.x == line.x && v.y == line.y) {
	            v.c_svg.style.color = "gray";
	            v.c_svg.classList.remove("vertex");
	            v.c_svg.classList.add("vertex_hover");
	          }
	        });

	        line.dest_x = e.clientX;
	        line.dest_y = e.clientY;
	        line.redraw();
	      }
	      else if (state == "resizing") {
	          deltaX = e.offsetX - dx;
	          deltaY = e.offsetY - dy;

	          dx = e.offsetX;
	          dy = e.offsetY;

	          source.form.resize(pos, deltaX, deltaY);
	          source.form.redraw();

	          lk.map( (link ) => {
	            link.redraw();
	          });
	      }
	    },
	    mouseUpCb: function mouseupcb(e) {
	      if (state == "drawing_link") {
	        id = e.srcElement.id;
	        var pnt = _Register.find(id);


	        if (pnt != undefined && pnt.ref != undefined) {
	          line.dest_x = pnt.x;
	          line.dest_y = pnt.y;

	          /* faire le calcul automatique ici*/

	          // for automatic redrawing
	          // line.redraw();
	          new Link(cp, pnt, line).redraw();
	        }
	        else if (id == "svg" || pnt.ref == undefined) {
	          var ref = document.getElementById(line.uuid);
	          ref.remove();
	        }
	      }
	      state = "";
	    },
	  mouseOverCb: function mouseovercb(e) {
	      // id = e.srcElement.id;

	      // cp = _Register.find(id);

	      // if (cp.type == "point") {
	      //   cp.form.vertex.map((v) => {
	      //     v.c_svg.classList.remove("vertex");
	      //     v.c_svg.classList.add("vertex_hover");
	      //   });

	      //   cp.form.c_points.map((v) => {
	      //     v.c_svg.style.color = "gray";
	      //     v.c_svg.classList.remove("vertex");
	      //     v.c_svg.classList.add("vertex_hover");
	      //   });
	      // }
	  },
	  mouseLeaveCb: function mouseleavecb(e) {
	    // id = e.srcElement.id;
	    // cp = _Register.find(id);
	    // if (cp.ref == undefined) {
	    //   cp.form.vertex.map((v) => {
	    //     v.c_svg.classList.add("vertex");
	    //     v.c_svg.classList.remove("vertex_hover");
	    //   });
	    //   cp.form.c_points.map((v) => {
	    //     v.c_svg.classList.add("vertex");
	    //     v.c_svg.classList.remove("vertex_hover");
	    //   });
	    // }
	  }
	}
	}
	var events = nativeEvents();

	/**
	 * @class Circle
	 */
	class Circle
	{
	    /**
	     * 
	     * @param {string} uuid 
	     * @param {number} x 
	     * @param {number} y 
	     * @param {number} r 
	     * @param {array of object} children 
	     * @param {object} ratio 
	     * @param {boolean} zoom 
	     */

	    constructor(uuid, x = 0, y = 0, r = 5, children = [], ratio = {}, zoom){

	        this.uuid = uuid;

	        this.x = x;
	        this.y = y;
	        this.r = r;

	        this.events = new EventManager();

	        this.children = [];

	        this.box = "";
	        this.c_svg = "";
	        this.type = "circle";

	        this.ratio = ratio;
	        this.zoom = zoom;
	      
	        this.c_points = [
	            new Point(this.uuid,0, 0 ),
	            new Point(this.uuid,0, 0 ),
	            new Point(this.uuid,0, 0 ),
	            new Point(this.uuid,0, 0 )
	        ];
	        this.vertex = [
	            new Point(this.uuid,0, 0 ),
	            new Point(this.uuid,0, 0 ),
	            new Point(this.uuid,0, 0 ),
	            new Point(this.uuid,0, 0 )
	        ];

	        this.createChildren(children);
	       
	        _Register.add(this);
	    }


	  
	    drawVertex(){
	        this.vertex[0].x = this.x - this.r;
	        this.vertex[0].y = this.y - this.r;
	    
	        this.vertex[1].x = this.x + this.r;
	        this.vertex[1].y = this.y - this.r;

	        this.vertex[2].x = this.x + this.r;
	        this.vertex[2].y = this.y + this.r;
	    
	        this.vertex[3].x = this.x - this.r;
	        this.vertex[3].y = this.y + this.r;

	        
	    }
	    
	    drawConnector() {
	        this.c_points[0].x = this.x;
	        this.c_points[0].y = this.y - this.r;

	        this.c_points[1].x = this.x + this.r;
	        this.c_points[1].y = this.y;


	        this.c_points[2].x = this.x;
	        this.c_points[2].y = this.y + this.r;

	        this.c_points[3].x = this.x - this.r;
	        this.c_points[3].y = this.y;
	    }

	    drawBox(){

	        var p = `M ${this.vertex[0].x} ${this.vertex[0].y}
                  L ${this.c_points[0].x} ${this.c_points[0].y} 
                  L ${this.vertex[1].x}   ${this.vertex[1].y} 
                  L ${this.c_points[1].x} ${this.c_points[1].y}
                  L ${this.vertex[2].x}   ${this.vertex[2].y}
                  L ${this.c_points[2].x} ${this.c_points[2].y} 
                  L ${this.vertex[3].x}   ${this.vertex[3].y} 
                  L ${this.c_points[3].x} ${this.c_points[3].y} Z`;
	    
	        this.box.setAttribute("d", p);
	      }
	    
	    /**
	     * 
	     * @param {DOMElement} svgs 
	     */
	    
	    draw(svgs){
	        var ns="http://www.w3.org/2000/svg";

	        this.box = document.createElementNS(ns, "path");
	        this.c_svg = document.createElementNS(ns,"circle");

	        this.c_svg.setAttribute("id", this.uuid);

	        this.c_svg.setAttribute("cx", this.x);

	        this.c_svg.setAttribute("cy",this.y);

	        this.c_svg.setAttribute("r", this.r);
	        
	        this.c_svg.setAttribute("fill", "rgb(224, 115, 115)");

	        this.c_svg.setAttribute("fill", "rgb(224, 115, 115)");

	        this.c_svg.setAttribute("stroke", "rgb(82, 170, 214)");

	    
	        this.c_svg.setAttribute("stroke-width", "1.5");
	    
	      
	        /** draw box */
	        this.drawBox();
	        this.box.setAttributeNS(null, "stroke", "rgb(82, 170, 214)");
	        this.box.setAttributeNS(null, "stroke-width", "1px");
	        this.box.setAttributeNS(null, "fill", "none");
	        this.box.setAttribute("stroke-dasharray", "4");

	        
	        svgs.appendChild(this.c_svg);
	        svgs.appendChild(this.box);

	        this.drawVertex();
	        this.drawConnector();

	        this.c_points.map((point) => {
	            point.draw(svgs);
	          });
	      
	          this.vertex.map((point) => {
	            point.draw(svgs);
	          });
	      

	        this.events.add(this.c_svg, "mousedown", events.mouseDownCb);

	        this.events.create();
	    }

	    shift(dx, dy){
	        this.x += dx;
	        this.y += dy;
	    }

	    redraw(){
	        this.c_svg.setAttribute("cx", this.x);
	        this.c_svg.setAttribute("cy",this.y);
	        this.c_svg.setAttribute("r", this.r);

	        this.drawConnector();
	        this.drawVertex();
	        this.drawBox();


	        this.vertex.map((vert) => {
	            vert.redraw();
	            });

	            this.c_points.map( (point) => {
	            point.redraw();
	        });

	    }

	    resize(pos, dx, dy, param = {}){
	        if(Object.keys(param).length > 0){
	            if( this.zoom == false && Object.keys(this.ratio).length > 0 ){
	                this.x = param.x + this.ratio.x * param.width;
	                this.y = param.y + this.ratio.y * param.height;
	            }
	            else {
	                this.x = param.x + this.ratio.x * param.width;
	                this.y = param.y + this.ratio.y * param.height;
	                (param.width <= param.height) ? this.r = this.ratio.r * param.width : this.r = this.ratio.r * param.height;
	            }
	        }
	        else {
	            if(pos == 0)
	                this.r += -dx;
	            else if(pos == 1)
	                this.r += dx;
	            else if(pos == 2)
	                this.r += dx;
	            else
	                this.r -= dx;
	        }

	        
	    }

	    createChildren(children){
	        children.map( (chd) => {

	        });
	    }

	}

	/**
	 * Rectangle class
	 */

	class Rectangle {

	  /**
	   * 
	   * @param {string} uuid 
	   * @param {number} x 
	   * @param {number} y 
	   * @param {number} width 
	   * @param {number} height 
	   * @param {array of object} children 
	   * @param {object} ratio 
	   */

	  constructor(uuid, x = 0, y = 0, width = 10, height = 10, children = [], ratio = {}, zoom = false) {

	    this.uuid = uuid;

	    this.x = x;
	    this.y = y;

	    this.width = width;
	    this.height = height;

	    this.events = new EventManager();

	    this.c_svg = "";

	    this.type = "rectangle";
	    this.children = [];
	    this.ratio = ratio;
	    this.zoom = zoom;


	    this.c_points = [
	      new Point(this.uuid, 0, 0),
	      new Point(this.uuid, 0, 0),
	      new Point(this.uuid, 0, 0),
	      new Point(this.uuid, 0, 0),
	    ];
	    this.vertex = [
	      new Point(this.uuid, 0, 0),
	      new Point(this.uuid, 0, 0),
	      new Point(this.uuid, 0, 0),
	      new Point(this.uuid, 0, 0),
	    ];

	    this.createChildren(children);
	  }


	  optimalPath(line){
	    var _x, _y;
	    var a = (line.dest_y - line.y)/(line.dest_x - line.x);
	    var b = line.y - a * line.x;

	    for (var i = 0; i <= 3; i++){
	        if(i % 2 == 0){
	            _y = this.vertex[i].y;
	            _x = (_y - b)/a;
	        }
	        else {
	            _x = this.vertex[i].x;
	            _y = a * _x + b;
	        }

	        if( (_x == line.x && _y == line.y) || (_x == line.dest_x && _y == line.dest_y))
	          continue;

	          if(((i == 0 &&  _x > this.vertex[i].x && _x < this.vertex[i+1].x) &&
	              (( line.x <= line.dest_x  && _x <= line.dest_x && _x >= line.x &&  a < 0 ? _y >= line.dest_y && _y <= line.y :_y <= line.dest_y && _y >= line.y  ) || 
	              ( line.x >= line.dest_x  && _x >= line.dest_x &&  _x <= line.x  &&  a < 0 ? _y <= line.dest_y &&  _y >= line.y : _y >= line.dest_y &&  _y <= line.y ) )) ||
	           ((i == 1 &&  _y > this.vertex[i].y && _y < this.vertex[i+1].y) &&
	              (( line.x <= line.dest_x  && _x <= line.dest_x && _x >= line.x &&  a < 0 ? _y >= line.dest_y && _y <= line.y :_y <= line.dest_y && _y >= line.y  ) || 
	              ( line.x >= line.dest_x  && _x >= line.dest_x &&  _x <= line.x  &&  a < 0 ? _y <= line.dest_y &&  _y >= line.y : _y >= line.dest_y &&  _y <= line.y ) )) || 
	           ((i == 2 &&  _x > this.vertex[i+1].x && _x < this.vertex[i].x) &&
	              (( line.x <= line.dest_x  && _x <= line.dest_x && _x >= line.x &&  a < 0 ? _y >= line.dest_y && _y <= line.y :_y <= line.dest_y && _y >= line.y  )|| 
	              ( line.x >= line.dest_x  && _x >= line.dest_x &&  _x <= line.x  &&  a < 0 ? _y <= line.dest_y &&  _y >= line.y : _y >= line.dest_y &&  _y <= line.y ))) ||
	           ((i == 3 &&  _y >= this.vertex[0].y && _y <= this.vertex[i].y) &&
	              (( line.x <= line.dest_x  && _x <= line.dest_x && _x >= line.x &&  a < 0 ? _y >= line.dest_y && _y <= line.y :_y <= line.dest_y && _y >= line.y  ) || 
	              ( line.x >= line.dest_x  && _x >= line.dest_x &&  _x <= line.x  &&  a < 0 ? _y <= line.dest_y &&  _y >= line.y : _y >= line.dest_y &&  _y <= line.y ) ) )) {
	            return this.c_points[i];
	           }
	      }
	    return null;
	  }


	  draw(svgs) {
	    const svgns = "http://www.w3.org/2000/svg";
	    this.c_svg = document.createElementNS(svgns, "rect");
	 
	  
	    this.c_svg.setAttributeNS(null, "x", this.x);
	    this.c_svg.setAttributeNS(null, "y", this.y);
	    this.c_svg.setAttributeNS(null, "id", this.uuid);
	    this.c_svg.setAttributeNS(null, "height", this.height);
	    this.c_svg.setAttributeNS(null, "width", this.width);
	    this.c_svg.setAttributeNS(null, "stroke", "black");
	    this.c_svg.setAttributeNS(null, "stroke-width", "3px");
	    this.c_svg.setAttributeNS(null, "fill", "cornsilk");

	  
	    svgs.appendChild(this.c_svg);

	    this.drawConnector();
	    this.drawVertex();

	    this.c_points.map((point) => {
	      point.draw(svgs);
	    });

	    this.vertex.map((point) => {
	      point.draw(svgs);
	    });


	    this.children.map((child) => {
	      child.draw(svgs);
	    });

	    this.events.add(this.c_svg, "mousedown", events.mouseDownCb);
	    this.events.add(this.c_svg, "mouseup", events.mouseUpCb);
	    this.events.add(this.c_svg, "mouseover", events.mouseOverCb);
	    this.events.add(this.c_svg, "mouseleave", events.mouseLeaveCb);

	    this.events.create();

	  }

	  drawVertex(){
	    this.vertex[0].x = this.x;
	    this.vertex[0].y = this.y;

	    this.vertex[1].x = this.x + this.width;
	    this.vertex[1].y = this.y;

	    this.vertex[2].x = this.x + this.width;
	    this.vertex[2].y = this.y + this.height;

	    this.vertex[3].x = this.x;
	    this.vertex[3].y = this.y + this.height;
	  }

	  drawConnector() {
	    this.c_points[0].x = this.x + this.width / 2;
	    this.c_points[0].y = this.y;

	    this.c_points[1].x = this.x + this.width;
	    this.c_points[1].y = this.y + this.height / 2;

	    this.c_points[2].x = this.x + this.width / 2;
	    this.c_points[2].y = this.y + this.height;

	    this.c_points[3].x = this.x;
	    this.c_points[3].y = this.y + this.height / 2;
	  }


	  shift(dx, dy) {
	    this.x += dx;
	    this.y += dy;

	    this.c_points.map((p) => {
	      p.shift(dx, dy);
	    });

	    this.vertex.map((p) => {
	      p.shift(dx, dy);
	    });
	  }


	  redraw() {

	    this.c_svg.setAttribute("x", this.x);
	    this.c_svg.setAttribute("y", this.y);
	    this.c_svg.setAttributeNS(null, "height", this.height);
	    this.c_svg.setAttributeNS(null, "width", this.width);

	   this.drawVertex();
	   this.drawConnector();

	   this.c_points.map((p) => {
	     p.redraw();
	   });

	   this.vertex.map((p) => {
	     p.redraw();
	   });

	   this.children.map ( (child) => {
	       child.redraw();
	   });

	  }

	  resize(pos, dx, dy, param = {} ) {

	    if(Object.keys(param).length > 0 && !this.zoom && Object.keys(this.ratio).length > 0){
	        this.x = param.x + (this.ratio.x * param.width);
	        this.y = param.y + (this.ratio.y * param.height);
	        this.width = this.ratio.width * param.width;
	        this.height = this.ratio.height * param.height;
	    }
	    else {
	      if (pos == 0) {

	        this.shift(dx, dy);
	  
	        this.width += -dx;
	        this.height += -dy;
	  
	        this.children.map ( (child) => {
	            child.resize(pos, dx, dy, { x: this.x, y: this.y, width: this.width, height: this.height});
	        });
	      } 
	      else if (pos == 1) {
	  
	        this.y += dy;
	  
	        this.width += dx;
	        this.height += -dy;
	  
	        this.children.map ( (child) => {
	          child.resize(pos, dx, dy, { x: this.x, y: this.y, width: this.width, height: this.height});
	        });
	      } 
	      else if (pos == 2) {
	  
	        this.width += dx;
	        this.height += dy;
	  
	        this.children.map ( (child) => {
	          child.resize(pos, dx, dy, { x: this.x, y: this.y, width: this.width, height: this.height});
	        });
	      }
	      else if (pos == 3) {
	  
	        this.x += dx;
	  
	        this.width += -dx;
	        this.height += dy;
	  
	        this.children.map ( (child) => {
	          child.resize(pos, dx, dy, { x: this.x, y: this.y, width: this.width, height: this.height});
	        });
	      }
	    }
	  }


	  createChildren(children){
	    children.map( (chd) => {
	      if(chd.type == "circle"){
	        var abs = this.x +  (chd.ratio.x * this.width);
	        var ord = this.y + (chd.ratio.y * this.height);
	        var rayon = (chd.ratio.r * this.width);
	        var child = FactoryForm.createForm(_uuid.generate(), chd.type, {x: abs, y: ord, r: rayon},[], chd.ratio, chd.zoom);
	        this.children.push(child);
	      }
	      else if(chd.type == "rectangle"){
	        var _x = this.x + (chd.ratio .x * this.width);
	        var _y = this.y + (chd.ratio.y * this.height);
	        var _width = chd.ratio.width * this.width;
	        var _height = chd.ratio.height * this.height ;
	        var child = FactoryForm.createForm(_uuid.generate(), chd.type, {x: _x, y: _y, width: _width, height: _height}, [], chd.ratio, chd.zoom);
	        this.children.push(child);
	      }
	      else if(chd.type == "triangle"){
	        var _x1 = this.x + (chd.ratio.p1.x * this.width);
	        var _y1 = this.y + (chd.ratio.p1.y * this.height); 
	      
	        var _x2 = this.x + (chd.ratio.p2.x * this.width);
	        var _y2 = this.y + (chd.ratio.p2.y * this.height); 

	        var _x3 = this.x + (chd.ratio.p3.x * this.width);
	        var _y3 = this.y + (chd.ratio.p3.y * this.height); 

	        var child = FactoryForm.createForm(_uuid.generate(), chd.type, {x1: _x1, y1: _y1, x2: _x2, y2: _y2, x3: _x3, y3: _y3}, [], chd.ratio, chd.zoom);
	        this.children.push(child);
	      }
	      else if(chd.type == "losange");
	    });
	  }
	}

	/**
	 * @class Triangle
	 */

	class Triangle {
	  /**
	   *
	   * @param {string} uuid
	   * @param {abscissa starting point} x1
	   * @param {ordonne starting point} y1
	   * @param {LineTo this abscissa point} x2
	   * @param {LineTo this ordonne point} y2
	   * @param {LineTo this abscissa point} x3
	   * @param {LineTo this ordonne point} y3
	   * @param {array of object} events
	   */
	  constructor( uuid, x1 = 0, y1 = 0, x2 = 5, y2 = 5, x3 = 10, y3 = 10, children = [], ratio = {}, zoom = false )
	  {

	    this.parent = uuid;
	    this.uuid = _uuid.generate();

	    this.x1 = x1;
	    this.y1 = y1;

	    this.x2 = x2;
	    this.y2 = y2;

	    this.x3 = x3;
	    this.y3 = y3;

	    this.events = new EventManager();

	    this.c_svg = "";
	    this.p = "";

	    this.type = "triangle";
	    this.ratio = ratio;
	    this.zoom = zoom;
	    this.box = "";  

	    this.children = [];

	    this.p1 = {x: 0, y: 0};
	    this.p2 = {x: 0, y: 0};
	    this.p3 = {x: 0, y: 0};

	    this.c_points = [
	      new Point(this.uuid,0, 0 ),
	      // new Point(this.uuid,0, 0 ),
	      // new Point(this.uuid,0, 0 ),
	      // new Point(this.uuid,0, 0 ),
	    ];

	    this.vertex = [
	        new Point(this.uuid,0, 0 ),
	        new Point(this.uuid,0, 0 ),
	        new Point(this.uuid,0, 0 ),
	        new Point(this.uuid,0, 0 ),
	        new Point(this.uuid,0, 0 ),
	    ];

	    this.createChildren(children);
	    _Register.add(this);
	  }

	  base(){
	    var base;
	               (this.x2 - this.x1) < (this.x2 - this.x3) ? 
	                 ( (this.x2 - this.x3) < (this.x3 - this.x1) && ( this.p1.x = this.x1, this.p1.y = this.y1,  this.p2.x = this.x3, this.p2.y = this.y3, this.p3.x = this.x2, this.p3.y = this.y2) ? 
	                    base = Math.sqrt((Math.pow((this.x3 - this.x1), 2) + Math.pow((this.y3 - this.y1), 2))) :
	                 base = Math.sqrt((Math.pow((this.x2 - this.x3), 2) + Math.pow((this.y2 - this.y3), 2))) )  &&( (this.p1.x = this.x2, this.p1.y = this.y2, this.p2.x = this.x3, this.p2.y = this.y3, this.p3.x = this.x1, this.p3.y = this.y1))  : 
	               (this.x2 - this.x1) < (this.x3 - this.x1)  && (( this.p1.x = this.x1, this.p1.y = this.y1, this.p2.x = this.x3, this.p2.y = this.y3, this.p3.x = this.x2, this.p3.y = this.y2)) ?
	                    base = Math.sqrt((Math.pow((this.x3 - this.x1), 2) + Math.pow((this.y3 - this.y1), 2))) : 
	                base = Math.sqrt((Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2))) && ( this.p1.x = this.x1, this.p1.y = this.y1, this.p2.x = this.x2, this.p2.y = this.y2, this.p3.x = this.x3, this.p3.y = this.y3);
	    return base;
	  }

	  perimeter(){
	    return (
	                (Math.sqrt((Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2))))
	               + (Math.sqrt((Math.pow((this.x3 - this.x1), 2) + Math.pow((this.y3 - this.y1), 2)))) 
	               + (Math.sqrt((Math.pow((this.x2 - this.x3), 2) + Math.pow((this.y2 - this.y3), 2)))) 
	            )/2;
	  }

	  area(){
	    return  this.perimeter() 
	              * (this.perimeter() - Math.sqrt((Math.pow((this.x2 - this.x1), 2) + Math.pow((this.y2 - this.y1), 2)))) 
	              * (this.perimeter() - Math.sqrt((Math.pow((this.x3 - this.x1), 2) + Math.pow((this.y3 - this.y1), 2))))
	              * (this.perimeter() - Math.sqrt((Math.pow((this.x2 - this.x3), 2) + Math.pow((this.y2 - this.y3), 2)))) ;
	  }

	  hauteur(){
	    return Math.sqrt(   ( (4 * this.area()) / Math.pow(this.base(), 2) )  )
	  }



	  // drawVertex(){
	  //   /* initialiser les coordonnées de chaque sommet*/

	  //   this.vertex[0].x = this.p1.x;
	  //   this.vertex[0].y = (this.p1.y > this.p3.y) ? this.p1.y - (this.p1.y - this.p3.y): this.p1.y;

	  // }

	 drawConnector() {
	     /* initialiser les coordonnées de chaque point de connexion*/

	     this.c_points[0].x = (this.x1 + this.x3) / 2;
	     this.c_points[0].y = (this.y1 + this.y3) / 2;
	}

	//  drawBox(){
	//      /* dessiner le contour de la forme sous forme de carré*/

	//      var p = `M ${this.vertex[0].x} ${this.vertex[0].y}
	//                L ${this.c_points[0].x} ${this.c_points[0].y} 
	//                L ${this.vertex[1].x}   ${this.vertex[1].y} 
	//                L ${this.c_points[1].x} ${this.c_points[1].y}
	//                L ${this.vertex[2].x}   ${this.vertex[2].y}
	//                L ${this.c_points[2].x} ${this.c_points[2].y} 
	//                L ${this.vertex[3].x}   ${this.vertex[3].y}
	//                L ${this.c_points[3].x} ${this.c_points[3].y} Z`;
	 
	//      this.box.setAttribute("d", p);
	// }


	  draw(svgs) {

	    const ns = "http://www.w3.org/2000/svg";
	    this.c_svg = document.createElementNS(ns, "path");
	    // this.box = document.createElementNS(ns, "path");


	    var p = "M " + this.x1 + "," + this.y1 + " " + "L " + this.x2 + "," + this.y2 + " " + "L " + this.x3 + "," + this.y3 + " Z";

	    this.c_svg.setAttribute("id", this.uuid);
	    this.c_svg.setAttribute("d", p);
	    this.c_svg.setAttributeNS(null, "stroke", "darkviolet");
	    this.c_svg.setAttributeNS(null, "stroke-width", "2px");
	    this.c_svg.setAttribute("fill", "lavenderblush");


	    this.drawConnector();
	    // this.drawVertex();

	    this.c_points.map((point) => {
	      point.draw(svgs);
	    });

	    /* dessin le contour */
	    // this.drawBox();
	    // this.box.setAttributeNS(null, "stroke", "rgb(82, 170, 214)");
	    // this.box.setAttributeNS(null, "stroke-width", "1px");
	    // this.box.setAttributeNS(null, "fill", "none");
	    // this.box.setAttribute("stroke-dasharray", "4");

	    
	    svgs.appendChild(this.c_svg);
	    // svgs.appendChild(this.box);


	    // this.vertex.map((v) => {
	    //   v.draw(svgs);
	    // });

	    // this.c_points.map((point) => {
	    //   point.draw(svgs);
	    // });

	    
	    this.events.add(this.c_svg, "mousedown", events.mouseDownCb);
	    this.events.add(this.c_svg, "mouseup", events.mouseUpCb);
	    this.events.add(this.c_svg, "mouseover", events.mouseOverCb);
	    this.events.add(this.c_svg, "mouseleave", events.mouseLeaveCb);

	    this.events.create();
	  }


	  shift(dx, dy) {
	    this.x1 += dx;
	    this.y1 += dy;

	    this.x2 += dx;
	    this.y2 += dy;

	    this.x3 += dx;
	    this.y3 += dy;

	    this.c_points.map((p) => {
	      p.shift(dx, dy);
	    });

	    this.vertex.map((v) => {
	      v.shift(dx, dy);
	    });

	    var cp = _Register.find(this.parent);

	    if(cp.type == "line"){
	      cp.form.x += cp.form.x == this.c_points[0].x && cp.form.y == this.c_points[0].y ? dx : 0;
	      cp.form.x += cp.form.x == this.c_points[0].x && cp.form.dest_y == this.c_points[0].y ? dx : 0;
	    }
	  }

	  redraw() {
	    var p = "M " + this.x1 + "," + this.y1 + " " + "L " + this.x2 + "," + this.y2 + " " + "L " + this.x3 + "," + this.y3 + " Z";

	    this.c_svg.setAttribute("d", p);

	    // this.drawVertex();
	    this.drawConnector();
	    // this.drawBox();


	    // this.vertex.map((v) => {
	    //   v.redraw();
	    // });

	    this.c_points.map((p) => {
	      p.redraw();
	    });

	    this.children.map ( (child) => {
	      child.redraw();
	  });
	  }
	  
	  resize(pos, dx, dy, param = {}) {

	    // console.log(this.ratio);
	    if(Object.keys(param).length > 0){
	        if(param.a == 0 && this.ratio.end == true);
	    }
	    else {
	      if (pos == 0) {
	        this.x1 = dx;
	        this.y1 = dy;
	        this.vertex[0].x = dx;
	        this.vertex[0].y = dy;
	      } 
	      else if (pos == 1) {
	        this.x2 = dx;
	        this.y2 = dy;
	        this.vertex[1].x = dx;
	        this.vertex[1].y = dy;
	      }
	      else if (pos == 2) {
	        this.x3 = dx;
	        this.y3 = dy;
	        this.vertex[2].x = dx;
	        this.vertex[2].y = dy;
	      }
	    }
	  }


	  createChildren(children){
	    children.map( (chd) => {

	    });
	  }
	}

	/**
	 * @class Losange
	 */


	class Losange {

	    /**
	     * @param {string} uuid
	     * @param {abscissa starting point} x1
	     * @param {ordonne starting point} y1
	     * @param {LineTo this abscisse point}x2
	     * @param {LineTo this ordonne point} y2
	     * @param {LineTo this abscisse point}x3
	     * @param {LineTo this ordonne point} y3
	     * @param {LineTo this ordonne point} x4
	     * @param {LineTo this ordonne point} y4
	     * @param {array of object} events
	     */

	    constructor(uuid, x1 = 0, y1 = 0, x2 = 0, y2 = 0, children = [], ratio = {}, zoom = false )
	    {
	        this.uuid = uuid;

	        this.x1 = x1;
	        this.y1 = y1;

	        this.x2 = x2;
	        this.y2 = y2;

	        this.x3 = this.x1;
	        this.y3 = this.y1 + (this.y2 - this.y1)*2;

	        this.x4 = this.x1 - (this.x2 - this.x1);
	        this.y4 = this.y2;

	        this.h_diagonal = this.x2 - this.x4;
	        this.v_diagonal = this.y3 - this.y1;

	        this.c_svg = "";
	        this.box = "";
	        this.type = "losange";

	        this.zoom = zoom;
	        this.ratio = ratio;

	        this.children = [];

	        this.events = new EventManager();
	        
	        this.c_points = [
	          new Point(this.uuid,0,0),
	          new Point(this.uuid,0,0),
	          new Point(this.uuid,0,0),
	          new Point(this.uuid,0,0),
	        ];

	        this.vertex = [
	          new Point(this.uuid, 0, 0),
	          new Point(this.uuid, 0, 0),
	          new Point(this.uuid, 0, 0),
	          new Point(this.uuid, 0, 0),
	        ];
	        this.createChildren(children);
	    }

	  draw(svgs) {
	    const ns = "http://www.w3.org/2000/svg";

	    this.c_svg = document.createElementNS(ns, "path");
	    this.box = document.createElementNS(ns, "path");

	    var p = `M ${this.x1} ${this.y1} L ${this.x2} ${this.y2} L ${this.x3} ${this.y3} L ${this.x4} ${this.y4} Z`;

	    this.box.setAttribute("id", this.uuid);
	    this.box.setAttributeNS(null, "stroke", "rgb(82, 170, 214)");
	    this.box.setAttributeNS(null, "stroke-width", "1px");
	    this.box.setAttributeNS(null, "fill", "none");
	    this.box.setAttribute("stroke-dasharray", "4");

	    this.c_svg.setAttribute("id", this.uuid);
	    this.c_svg.setAttribute("d", p);
	    this.c_svg.setAttributeNS(null, "stroke", "darkviolet");
	    this.c_svg.setAttributeNS(null, "stroke-width", "2px");
	    this.c_svg.setAttribute("fill", "lavenderblush");

	    svgs.appendChild(this.c_svg);
	    svg.appendChild(this.box);

	    this.drawVertex();
	    this.drawConnector();

	    this.c_points.map((point) => {
	        point.draw(svgs);
	      });

	    this.vertex.map((v) => {
	        v.draw(svgs);
	      });
	    
	    this.events.add(this.c_svg, "mousedown", events.mouseDownCb);
	    this.events.add(this.c_svg, "mouseup", events.mouseUpCb);
	    this.events.add(this.c_svg, "mouseover", events.mouseOverCb);

	    this.events.create();
	  }

	  drawVertex(){
	    this.vertex[0].x = this.x1 - ( (this.x2 - this.x4) / 2);
	    this.vertex[0].y = this.y1;

	    this.vertex[1].x = this.x1 + ( (this.x2 - this.x4) / 2);
	    this.vertex[1].y = this.y1;

	    this.vertex[2].x = this.x2;
	    this.vertex[2].y = this.y3;

	    this.vertex[3].x = this.x4;
	    this.vertex[3].y = this.y3;
	  }


	  drawConnector() {
	    this.c_points[0].x = this.x1;
	    this.c_points[0].y = this.y1;

	    this.c_points[1].x = this.x2;
	    this.c_points[1].y = this.y2;

	    this.c_points[2].x = this.x3;
	    this.c_points[2].y = this.y3;

	    this.c_points[3].x = this.x4;
	    this.c_points[3].y = this.y4;
	  }

	  resize(pos, dx, dy, param = {}) {

	    if(Object.keys(param).length > 0);
	    else {
	      if(pos == 0){
	        this.x1 += dx;
	        this.y1 += dy;

	        this.x3 = this.x1;
	        this.y3 = this.y1 + (this.y2 - this.y1)*2;

	        this.x4 = this.x1 - (this.x2 - this.x1);
	        this.y4 = this.y2;
	      }
	      else if(pos == 1){

	        this.x1 += dx;
	        this.y1 += dy;

	        this.x3 = this.x1;
	        this.y3 = this.y1 + (this.y2 - this.y1)*2;

	        this.x2 = this.x1 + (this.x1 - this.x4);
	        this.y2 = this.y4;
	      }
	      else if(pos == 2){
	        this.x1 += dx;
	        this.y1 += -dy;

	        this.x3 = this.x1;
	        this.y3 = this.y1 + (this.y2 - this.y1)*2;

	        this.x2 = this.x1 + (this.x1 - this.x4);
	        this.y2 = this.y4;
	      }
	      else if(pos == 3){
	        this.x1 += dx;
	        this.y1 += -dy;

	        this.x3 = this.x1;
	        this.y3 = this.y1 + (this.y2 - this.y1)*2;

	        this.x4 = this.x1 - (this.x2 - this.x1);
	        this.y4 = this.y2;
	      }
	    }
	  }

	  redraw() {

	    var p = `M ${this.x1} ${this.y1} L ${this.x2} ${this.y2} L ${this.x3} ${this.y3} L ${this.x4} ${this.y4} Z`;

	    this.drawVertex();
	    this.drawConnector();
	    this.drawBox();

	    this.c_svg.setAttribute("d", p);

	    this.c_points.map((p) => {
	        p.redraw();
	      });
	      this.vertex.map((v) => {
	        v.redraw();
	      });
	  }

	  drawBox(){

	    /* dessin du contour de la forme sous forme de carré */

	    var p = `M ${this.vertex[0].x} ${this.vertex[0].y}
              L ${this.c_points[0].x} ${this.c_points[0].y} 
              L ${this.vertex[1].x}   ${this.vertex[1].y} 
              L ${this.c_points[1].x} ${this.c_points[1].y}
              L ${this.vertex[2].x}   ${this.vertex[2].y}
              L ${this.c_points[2].x} ${this.c_points[2].y} 
              L ${this.vertex[3].x}   ${this.vertex[3].y} 
              L ${this.c_points[3].x} ${this.c_points[3].y} Z`;

	    this.box.setAttribute("d", p);
	  }

	  shift(dx, dy) {
	    this.x1 += dx;
	    this.y1 += dy;

	    this.x2 += dx;
	    this.y2 += dy;

	    this.x3 += dx;
	    this.y3 += dy;

	    this.x4 += dx;
	    this.y4 += dy;

	    this.c_points.map((p) => {
	      p.shift(dx, dy);
	    });

	    this.vertex.map((v) => {
	      v.shift(dx, dy);
	    });
	  }

	  createChildren(children){
	    children.map( (chd) => {

	    });
	  }

	}

	/**
	 * @class FactoryForm
	 */


	class FactoryForm
	{
	    /**
	     * 
	     * @param {string} uuid 
	     * @param {string} type 
	     * @param {object} props 
	     * @param {array of object} children 
	     * @param {pbject} ratio 
	     * @param {boolean} zoom 
	     * @returns @form
	     */

	   static createForm(uuid, type, props = {}, children = [], ratio = {}, zoom = false)
	    {
	        if(type == "circle")
	            return new Circle(uuid, props.x, props.y, props.r, children, ratio, zoom);
	        else if(type == "rectangle")
	            return new Rectangle(uuid, props.x, props.y, props.width, props.height, children, ratio, zoom);
	        else if(type == "line")
	            return new Line(uuid, props.x, props.y, props.dest_x, props.dest_y, children, ratio, zoom);
	        else if(type == "triangle")
	            return new Triangle(uuid, props.x1, props.y1, props.x2, props.y2, props.x3, props.y3, children, ratio, zoom);
	        else if(type == "losange")
	            return new Losange(uuid, props.x1, props.y1, props.x2, props.y2, children, ratio, zoom);
	    }
	}

	class Component
	{
	    /**
	     * 
	     * @param {string} type 
	     * @param {array} events 
	     * @param {object} params 
	     */
	    constructor( type, props, children = [])
	    {
	        this.uuid = _uuid.generate();
	        this.type = type;
	        this.form = FactoryForm.createForm(this.uuid, type, props, children);
	        _Register.add(this);
	        this.form.draw(svg);
	    }
	}

	class Connector {
	  static create(type, uuid) {
	    var cp = [];

	    if (type == "rectangle") {
	      cp = [];
	      for (var i = 0; i < 4; i++) {
	        cp.push(new Point(uuid, 0, 0));
	      }
	    } 
	    else if (type == "triangle") {
	      cp = [];
	      for (var i = 0; i < 3; i++) {
	        cp.push(new Point(uuid, 0, 0));
	      }
	    } 
	    else if (type == "circle") {
	      cp = [];
	      for (var i = 0; i < 4; i++) {
	        cp.push(new Point(uuid, 0, 0));
	      }
	    } 
	    else if (type == "losange") {
	      cp = [];
	      for (var i = 0; i < 6; i++) {
	        cp.push(new Point(uuid, 0, 0));
	      }
	    }
	    else ;
	    return cp;
	  }
	}

	exports.Circle = Circle;
	exports.Component = Component;
	exports.Connector = Connector;
	exports.FactoryForm = FactoryForm;
	exports.Line = Line;
	exports.Losange = Losange;
	exports.Point = Point;
	exports.Rectangle = Rectangle;
	exports.Triangle = Triangle;
	exports._Register = _Register;
	exports._uuid = _uuid;
	exports.events = events;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
