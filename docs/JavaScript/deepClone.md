### 深拷贝 VS 浅拷贝
深拷贝和浅拷贝都是针对的引用类型，JS中的变量类型分为值类型（基本类型）和引用类型；对值类型进行复制操作会对值进行一份拷贝，而对引用类型赋值，则会进行地址的拷贝，最终两个变量指向同一份数据

```js
// 基本类型
var a = 1;
var b = a;
a = 2;
console.log(a, b); // 2, 1 ，a b指向不同的数据

// 引用类型指向同一份数据
var a = {c: 1};
var b = a;
a.c = 2;
console.log(a.c, b.c); // 2, 2 全是2，a b指向同一份数据
```

对于引用类型，会导致a b指向同一份数据，此时如果对其中一个进行修改，就会影响到另外一个，有时候这可能不是我们想要的结果，如果对这种现象不清楚的话，还可能造成不必要的bug

那么如何切断a和b之间的关系呢，可以拷贝一份a的数据，根据拷贝的层级不同可以分为浅拷贝和深拷贝，浅拷贝就是只进行一层拷贝，深拷贝就是无限层级拷贝

```js
var a1 = {b: {c: {}};

var a2 = shallowClone(a1); // 浅拷贝
a2.b.c === a1.b.c // true

var a3 = clone(a1); // 深拷贝
a3.b.c === a1.b.c // false

```

浅拷贝的实现非常简单，而且还有多种方法，其实就是遍历对象属性的问题，这里只给出一种，如果看不懂下面的方法，或对其他方法感兴趣，可以自行学习。

```js
var a1 = {b: {c: {}};

var a2 = shallowClone(a1); // 浅拷贝
a2.b.c === a1.b.c // true

var a3 = clone(a1); // 深拷贝
a3.b.c === a1.b.c // false

```

### 最简单的深拷贝

深拷贝的问题其实可以分解成两个问题，浅拷贝+递归，什么意思呢？假设我们有如下数据

```
var a1 = {b: {c: {d: 1}};

```

只需稍加改动上面浅拷贝的代码即可，注意区别

```js
function clone(source) {
    var target = {};
    for(var i in source) {
        if (source.hasOwnProperty(i)) {
            if (typeof source[i] === 'object') {
                target[i] = clone(source[i]); // 注意这里
            } else {
                target[i] = source[i];
            }
        }
    }

    return target;
}

```

大部分人都能写出上面的代码，但当我问上面的代码有什么问题吗？就很少有人答得上来了，聪明的你能找到问题吗？

其实上面的代码问题太多了，先来举几个例子吧

- 没有对参数做检验
- 判断是否对象的逻辑不够严谨
- 没有考虑数组的兼容

(⊙o⊙)，下面我们来看看各个问题的解决办法，首先我们需要抽象一个判断对象的方法，其实比较常用的判断对象的方法如下，其实下面的方法也有问题，但如果能够回答上来那就非常不错了

```js
function isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]';
}

```

函数需要校验参数，如果不是对象的话直接返回

```js
function clone(source) {
    if (!isObject(source)) return source;

    // xxx
}
```

关于第三个问题，嗯，就留给大家自己思考吧，本文为了减轻大家的负担，就不考虑数组的情况了，其实ES6之后还要考虑set, map, weakset, weakmap，/(ㄒoㄒ)/~~

其实吧这三个都是小问题，其实递归方法最大的问题在于爆栈，当数据的层次很深是就会栈溢出

下面的代码可以生成指定深度和每层广度的代码，这段代码我们后面还会再次用到

```js
function createData(deep, breadth) {
    var data = {};
    var temp = data;

    for (var i = 0; i < deep; i++) {
        temp = temp['data'] = {};
        for (var j = 0; j < breadth; j++) {
            temp[j] = j;
        }
    }

    return data;
}

createData(1, 3); // 1层深度，每层有3个数据 {data: {0: 0, 1: 1, 2: 2}}
createData(3, 0); // 3层深度，每层有0个数据 {data: {data: {data: {}}}}

```

当clone层级很深的话就会栈溢出，但数据的广度不会造成溢出

```js
clone(createData(1000)); // ok
clone(createData(10000)); // Maximum call stack size exceeded

clone(createData(10, 100000)); // ok 广度不会溢出

```

其实大部分情况下不会出现这么深层级的数据，但这种方式还有一个致命的问题，就是循环引用，举个例子

```js
var a = {};
a.a = a;

clone(a) // Maximum call stack size exceeded 直接死循环了有没有，/(ㄒoㄒ)/~~
```

关于循环引用的问题解决思路有两种，一直是循环检测，一种是暴力破解，关于循环检测大家可以自己思考下；关于暴力破解我们会在下面的内容中详细讲解

### 一行代码的深拷贝

有些同学可能见过用系统自带的JSON来做深拷贝的例子，下面来看下代码实现

```js
function cloneJSON(source) {
    return JSON.parse(JSON.stringify(source));
}

```

其实我第一次简单这个方法的时候，由衷的表示佩服，其实利用工具，达到目的，是非常聪明的做法

下面来测试下cloneJSON有没有溢出的问题，看起来cloneJSON内部也是使用递归的方式

```js
cloneJSON(createData(10000)); // Maximum call stack size exceeded

```

既然是用了递归，那循环引用呢？并没有因为死循环而导致栈溢出啊，原来是JSON.stringify内部做了循环引用的检测，正是我们上面提到破解循环引用的第一种方法：循环检测

```js
var a = {};
a.a = a;

cloneJSON(a) // Uncaught TypeError: Converting circular structure to JSON

```

### 破解递归爆栈

功能较为完整的深拷贝。

```js
function deepClone(target,cache = new Map()){
  if(cache.get(target)){
      return cache.get(target)
  }
  if(target instanceof Object){
      let dist ;
      if(target instanceof Array){
        // 拷贝数组
        dist = [];
      }else if(target instanceof Function){
        // 拷贝函数
        dist = function () {
          return target.call(this, ...arguments);
        };
      }else if(target instanceof RegExp){
        // 拷贝正则表达式
       dist = new RegExp(target.source,target.flags);
      }else if(target instanceof Date){
          dist = new Date(target);
      }else{
        // 拷贝普通对象
        dist = {};
      }
      // 将属性和拷贝后的值作为一个map
      cache.set(target, dist);
      for(let key in target){
          // 过滤掉原型身上的属性
        if (target.hasOwnProperty(key)) {
            dist[key] = deepClone(target[key], cache);
        }
      }
      return dist;
  }else{
      return target;
  }
}

```

