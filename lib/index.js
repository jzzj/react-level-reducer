'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var components = {};

/*
pipe like: 
{
  targetName: {
    child1Name: [],
    child2Name: [],
    child3Name: [],
  }
}
*/
var pipe = {};

/*
orders like: 
{
  targetName: [child1Name, child2Name, child3Name]
}
*/
var orders = {};
/*
    CHILDREN                 REDUCER                 PARENT
 根据用户点击触发向      收到push过来的渲染方法，      被动触发渲染方法，
reducer中push对应的     存储在目标组件的管道中，   从管道中拉取对应渲染好的元素
    渲染方法            触发目标组件的渲染方法      触发渲染，re-render
                                                ORDER DOES MATTER!    

*/

var ReactLevelReducer = function () {
  function ReactLevelReducer(component) {
    _classCallCheck(this, ReactLevelReducer);

    this.component = component;
    register(component);
  }

  /*
  * @params componentName, ...renderMethods
  * renderMethods could be function or react-elems
  */


  _createClass(ReactLevelReducer, [{
    key: 'renderTo',
    value: function renderTo(componentName) {
      var _this = this;

      var targetComponent = getComponentInstance(componentName);
      if (targetComponent == null) {
        throw new Error('The target component: [' + componentName + '] has not been registered! Please call ReactLevelReducer.register(componentInstance) to register the component.');
      } else {
        var currentName = getComponentName(this.component);
        var pipeline = pipe[componentName];
        var order = orders[componentName];
        if (!pipeline) {
          pipe[componentName] = pipeline = {};
        }
        if (!order) {
          orders[componentName] = order = [];
        }

        // reset pipeline to empty
        var currentPipe = pipeline[currentName] = [];

        // resort the order of target component
        resort(order, currentName);

        for (var _len = arguments.length, renderMethods = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          renderMethods[_key - 1] = arguments[_key];
        }

        renderMethods.forEach(function (method) {
          var elem = void 0;
          if (typeof method === 'function') {
            elem = method.call(_this.component);
          } else {
            elem = method;
          }
          currentPipe.push(elem);
        });

        if (targetComponent.onRecieveLevelReduce) {
          targetComponent.onRecieveLevelReduce.call(targetComponent, _getElementsFromPipe(targetComponent));
        } else {
          console.error("Target component:[" + componentName + "] does not provide a method called onRecieveLevelReduce, please check!");
        }
      }
    }
  }, {
    key: 'getElementsFromPipe',
    value: function getElementsFromPipe() {
      var currentName = getComponentName(this.component);
      return _getElementsFromPipe(currentName);
    }
  }]);

  return ReactLevelReducer;
}();

ReactLevelReducer.getComponentInstance = getComponentInstance;
ReactLevelReducer.getComponentName = getComponentName;
ReactLevelReducer.register = register;
ReactLevelReducer.getElementsFromPipe = _getElementsFromPipe;
exports.default = ReactLevelReducer;


function _getElementsFromPipe(currentName) {
  currentName = getComponentName(currentName);
  var pipeline = pipe[currentName];
  var order = orders[currentName] || [];
  var result = [];
  for (var i = 0, len = order.length; i < len; i++) {
    result = result.concat(pipeline[order[i]]);
  }
  return result;
}

function resort(order, name) {
  var idx = order.indexOf(name);
  if (idx !== -1) {
    order.splice(idx, 1);
  }
  order.push(name);
  return order;
}

function register(component, Constructor) {
  if (typeof Constructor === 'function') {
    components[component] = Constructor;
  } else {
    var componentName = getComponentName(component);
    if (!componentName) {
      throw new Error("Name of component is required! Please checkout [" + component + "] .");
    } else if (/default/.test(componentName)) {
      throw new Error("You are useing the default name, that's highly not recommended! Please checkout [" + component.constructor.toString() + "] .");
    } else {
      components[componentName] = component;
    }
  }
}

function getComponentName(component) {
  if (typeof component === 'string') {
    return component;
  }
  var constructor = component.constructor;
  return constructor.name || constructor.displayName;
}

function getComponentInstance(componentName) {
  if (!componentName) throw new Error('Required componentName!');
  return components[componentName] || null;
}