"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sinon_1 = require("sinon");
var sinonChai = require("sinon-chai");
var iterall_1 = require("iterall");
var pubsub_1 = require("../pubsub");
var with_filter_1 = require("../with-filter");
chai.use(chaiAsPromised);
chai.use(sinonChai);
var expect = chai.expect;
var graphql_1 = require("graphql");
var subscription_1 = require("graphql/subscription");
var FIRST_EVENT = 'FIRST_EVENT';
function buildSchema(iterator) {
    return new graphql_1.GraphQLSchema({
        query: new graphql_1.GraphQLObjectType({
            name: 'Query',
            fields: {
                testString: {
                    type: graphql_1.GraphQLString,
                    resolve: function (_, args) {
                        return 'works';
                    },
                },
            },
        }),
        subscription: new graphql_1.GraphQLObjectType({
            name: 'Subscription',
            fields: {
                testSubscription: {
                    type: graphql_1.GraphQLString,
                    subscribe: with_filter_1.withFilter(function () { return iterator; }, function () { return true; }),
                    resolve: function (root) {
                        return 'FIRST_EVENT';
                    },
                },
            },
        }),
    });
}
describe('GraphQL-JS asyncIterator', function () {
    it('should allow subscriptions', function () {
        var query = graphql_1.parse("\n      subscription S1 {\n        testSubscription\n      }\n    ");
        var pubsub = new pubsub_1.PubSub();
        var origIterator = pubsub.asyncIterator(FIRST_EVENT);
        var schema = buildSchema(origIterator);
        var results = subscription_1.subscribe(schema, query);
        var payload1 = results.next();
        expect(iterall_1.isAsyncIterable(results)).to.be.true;
        var r = payload1.then(function (res) {
            expect(res.value.data.testSubscription).to.equal('FIRST_EVENT');
        });
        pubsub.publish(FIRST_EVENT, {});
        return r;
    });
    it('should clear event handlers', function () {
        var query = graphql_1.parse("\n      subscription S1 {\n        testSubscription\n      }\n    ");
        var pubsub = new pubsub_1.PubSub();
        var origIterator = pubsub.asyncIterator(FIRST_EVENT);
        var returnSpy = sinon_1.spy(origIterator, 'return');
        var schema = buildSchema(origIterator);
        var results = subscription_1.subscribe(schema, query);
        var end = results.return();
        var r = end.then(function (res) {
            expect(returnSpy).to.have.been.called;
        });
        pubsub.publish(FIRST_EVENT, {});
        return r;
    });
});
//# sourceMappingURL=asyncIteratorSubscription.js.map