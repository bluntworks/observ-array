var test = require("tape")
var Observ = require("observ")
var computed = require("observ/computed")

var ObservArray = require("../index")

test("ObservArray is a function", function (assert) {
    assert.equal(typeof ObservArray, "function")
    assert.end()
})

test("ObservArray contains correct initial value", function (assert) {
    var arr = ObservArray([
        Observ("foo"),
        Observ("bar"),
        Observ("baz"),
        "foobar"
    ])
    var initial = arr()

    assert.equal(typeof arr.filter, "function")
    assert.equal(typeof arr.splice, "function")
    assert.equal(initial.length, 4)
    assert.deepEqual(initial, ["foo", "bar", "baz", "foobar"])

    assert.equal(arr[0], undefined)
    assert.equal(arr[1], undefined)
    assert.notEqual(arr.length, 4)

    assert.end()
})

test("ObservArray emits change", function (assert) {
    var arr = ObservArray([
        Observ("foo"),
        Observ("bar")
    ])
    var initArr = arr()
    var changes = []

    arr(function (state) {
        changes.push(state)
    })

    arr.get(0).set("foo2")
    arr.get(1).set("bar2")

    assert.equal(changes.length, 2)
    assert.deepEqual(initArr, ["foo", "bar"])
    assert.notEqual(initArr, changes[0])
    assert.notEqual(changes[0], changes[1])
    assert.deepEqual(changes[0].slice(), ["foo2", "bar"])
    assert.deepEqual(changes[1].slice(), ["foo2", "bar2"])

    assert.end()
})

test("works with nested arrays", function (assert) {
    var arr = ObservArray([
        Observ("foo"),
        ObservArray([
            Observ("bar"),
            Observ("baz")
        ])
    ])
    var initArr = arr()
    var changes = []
    var innerChanges = []

    arr(function (state) {
        changes.push(state)
    })

    arr.get(1)(function (state) {
        innerChanges.push(state)
    })

    arr.get(1).get(0).set("bar2")
    arr.get(0).set("foo2")
    arr.get(1).get(1).set("baz2")

    assert.equal(changes.length, 3)
    assert.equal(innerChanges.length, 2)

    assert.notEqual(changes[0], initArr)
    assert.notEqual(changes[1], changes[0])
    assert.notEqual(changes[2], changes[1])

    assert.notEqual(innerChanges[0], initArr[1])
    assert.notEqual(innerChanges[1], innerChanges[0])

    assert.deepEqual(initArr, [
        "foo",
        ["bar", "baz"]
    ])
    assert.equal(changes[0][0], "foo")
    assert.deepEqual(changes[0][1].slice(), ["bar2", "baz"])
    assert.equal(changes[1][0], "foo2")
    assert.deepEqual(changes[1][1].slice(), ["bar2", "baz"])
    assert.equal(changes[2][0], "foo2")
    assert.deepEqual(changes[2][1].slice(), ["bar2", "baz2"])

    assert.deepEqual(initArr[1], ["bar", "baz"])
    assert.deepEqual(innerChanges[0].slice(), ["bar2", "baz"])
    assert.deepEqual(innerChanges[1].slice(), ["bar2", "baz2"])

    assert.equal(changes[0][1], changes[1][1],
        "unchanged properties are the same value")

    assert.end()
})

test("can call array methods on value inside", function (assert) {
    var arr = ObservArray([ Observ("foo"), Observ("bar") ])

    var v = arr()

    var list = v.slice()
    var doubles = list.map(function (v) {
        return v + v
    })

    assert.ok(Array.isArray(v))
    assert.deepEqual(doubles, [ "foofoo", "barbar" ])

    assert.end()
})

test("can call array methods on ObservArray", function (assert) {
    var arr = ObservArray([
        Observ(0),
        Observ(1),
        Observ(2),
        Observ(3),
        Observ(5)
    ])

    var doubles = arr.map(function (o) {
        return computed([o], function (o) { return o * 2 })
    })
    var changes = []

    doubles(function (state) {
        changes.push(state)
    })

    assert.equal(typeof doubles.get, "function")
    assert.equal(typeof doubles.getLength, "function")
    assert.equal(Array.isArray(doubles), false)

    arr.get(2).set(5)

    assert.equal(changes.length, 1)
    assert.deepEqual(changes[0].slice(), [
        0, 2, 10, 6, 10
    ])

    doubles.push(Observ(8))

    assert.equal(changes.length, 2)
    assert.deepEqual(changes[1].slice(), [
        0, 2, 10, 6, 10, 8
    ])

    assert.end()
})

test("can add values to observ array", function (assert) {
    var arr = ObservArray([
        Observ("foo"),
        Observ("bar")
    ])
    var changes = []

    arr(function (state) {
        changes.push(state)
    })

    arr.push(Observ("baz"))
    arr.splice(1, 1)

    assert.equal(changes.length, 2)
    assert.deepEqual(changes[0].slice(), ["foo", "bar", "baz"])
    assert.deepEqual(changes[1].slice(), ["foo", "baz"])

    assert.end()
})

test("can add values to observ array & listen")
test("can remove values to observ & not blow up")