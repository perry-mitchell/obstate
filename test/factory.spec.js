import { expect } from "chai";
import sinon from "sinon";
import { createStateObject } from "../dist/factory.js";

describe("factory", function() {
    describe("createStateObject", function() {
        it("creates an identical object", function() {
            const state = createStateObject({ a: 1, b: 2 });
            expect(state).to.have.property("a", 1);
            expect(state).to.have.property("b", 2);
        });

        it("provides a EventEmitter interface", function() {
            const state = createStateObject({ a: 1, b: 2 });
            expect(state.emit).to.be.a("function");
            expect(state.on).to.be.a("function");
            expect(state.off).to.be.a("function");
        });

        describe("(state instance)", function() {
            beforeEach(function() {
                this.state = createStateObject({
                    num: 123,
                    str: "hello",
                    bool: false,
                    empty: null
                });
            });

            it("allows changing properties", function() {
                Object.assign(this.state, {
                    num: 456,
                    str: "bye",
                    bool: true,
                    empty: 1
                });
                expect(this.state).to.deep.equal({
                    num: 456,
                    str: "bye",
                    bool: true,
                    empty: 1
                });
            });

            it("emits 'before' & 'update' events when changing values", function() {
                const beforeSpy = sinon.spy();
                const afterSpy = sinon.spy();
                this.state.on("before", beforeSpy);
                this.state.on("update", afterSpy);
                this.state.num = 0;
                expect(beforeSpy.callCount).to.equal(1, "'before' should have been called once");
                expect(afterSpy.callCount).to.equal(1, "'update' should have been called once");
                expect(beforeSpy.firstCall.args[0]).to.deep.equal({
                    property: "num",
                    currentValue: 123,
                    newValue: 0
                });
                expect(afterSpy.firstCall.args[0]).to.deep.equal({
                    property: "num",
                    oldValue: 123,
                    newValue: 0
                });
                expect(beforeSpy.calledBefore(afterSpy)).to.be.true;
            });
        });
    });
});
