﻿/*!
 * Slider for Bootstrap
 *
 * Copyright 2012 Stefan Petre
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */
.slider {
    display: inline-block;
    vertical-align: middle;
    position: relative;
}
.slider.slider-horizontal {
    width: 210px;
    height: 20px;
}
.slider.slider-horizontal .slider-track {
    height: 10px;
    width: 100%;
    margin-top: -5px;
    top: 50%;
    left: 0;
}
.slider.slider-horizontal .slider-selection {
    height: 100%;
    top: 0;
    bottom: 0;
}
.slider.slider-horizontal .slider-handle {
    margin-left: -10px;
    margin-top: -5px;
}
.slider.slider-horizontal .slider-handle.triangle {
    border-width: 0 10px 10px 10px;
    width: 0;
    height: 0;
    border-bottom-color: #0480be;
    margin-top: 0;
}
.slider.slider-vertical {
    height: 210px;
    width: 20px;
}
.slider.slider-vertical .slider-track {
    width: 10px;
    height: 100%;
    margin-left: -5px;
    left: 50%;
    top: 0;
}
.slider.slider-vertical .slider-selection {
    width: 100%;
    left: 0;
    top: 0;
    bottom: 0;
}
.slider.slider-vertical .slider-handle {
    margin-left: -5px;
    margin-top: -10px;
}
.slider.slider-vertical .slider-handle.triangle {
    border-width: 10px 0 10px 10px;
    width: 1px;
    height: 1px;
    border-left-color: #0480be;
    margin-left: 0;
}
.slider input {
    display: none;
}
.slider .tooltip-inner {
    white-space: nowrap;
}
.slider-track {
    position: absolute;
    cursor: pointer;
    background-color: #f7f7f7;
    background-image: -moz-linear-gradient(top, #f5f5f5, #f9f9f9);
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f5f5f5), to(#f9f9f9));
    background-image: -webkit-linear-gradient(top, #f5f5f5, #f9f9f9);
    background-image: -o-linear-gradient(top, #f5f5f5, #f9f9f9);
    background-image: linear-gradient(to bottom, #f5f5f5, #f9f9f9);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#fff5f5f5', endColorstr='#fff9f9f9', GradientType=0);
    -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    -moz-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
}
.slider-selection {
    position: absolute;
    background-color: #f7f7f7;
    background-image: -moz-linear-gradient(top, #f9f9f9, #f5f5f5);
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f9f9f9), to(#f5f5f5));
    background-image: -webkit-linear-gradient(top, #f9f9f9, #f5f5f5);
    background-image: -o-linear-gradient(top, #f9f9f9, #f5f5f5);
    background-image: linear-gradient(to bottom, #f9f9f9, #f5f5f5);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#fff9f9f9', endColorstr='#fff5f5f5', GradientType=0);
    -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    -moz-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
}
.slider-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: #0e90d2;
    background-image: -moz-linear-gradient(top, #149bdf, #0480be);
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#149bdf), to(#0480be));
    background-image: -webkit-linear-gradient(top, #149bdf, #0480be);
    background-image: -o-linear-gradient(top, #149bdf, #0480be);
    background-image: linear-gradient(to bottom, #149bdf, #0480be);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff149bdf', endColorstr='#ff0480be', GradientType=0);
    -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
    -moz-box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05);
    opacity: 0.8;
    border: 0px solid transparent;
}
.slider-handle.round {
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;
}
.slider-handle.triangle {
    background: transparent none;
}