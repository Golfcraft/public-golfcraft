import {expect} from "chai";
import 'mocha';

import { createPhysicsWorld } from "../golfplay/physics/world"
import { loadCoursePhysics } from "../golfplay/physics/course-element-loader"

import test_course from "./data/test_course";

declare const CANNON;

it('Main page content', function(done) {
    const world = createPhysicsWorld();

    const course = loadCoursePhysics(world, test_course);



    expect(true).to.equal(true);
    done();
});
