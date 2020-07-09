"use strict";
/* jshint node:true */

/**
 * Individual
 *
 * API: Individual
 *
 * @description: Individual stores Individual information.
 */
var Base = require("./common/base");

const requiredParams = ["first_name"];
var individual = new Base(requiredParams);
module.exports = individual;
