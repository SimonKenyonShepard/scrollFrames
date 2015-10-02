window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

var scrollFrames = function(scrollFramesCSS) {

	var scrollFrameDeclarations,
		scrollElements,
		animationFrameData = {},
		windowHeight = $(window).height(),
		scrolling = false,
		container;

	var init = function() {
		getCSS(scrollFramesCSS);
	};

	var getCSS = function(scrollFramesCSS) {
		$.get(scrollFramesCSS, function(template) {
               scrollFrameDeclarations = convertCSS2JSON(template);
        });
	};

	var convertCSS2JSON = function(css) {
		//add commas to end of objects
		var sanitized = css.replace(/}/g, "},");
		//add quotes to object names
		sanitized = sanitized.replace(/([\w%]+) {/g, "\"$1\" : {");
		//remove scrollFrames syntax
		sanitized = sanitized.replace(/@scrollframes/g, "");
		//remove line breaks
		sanitized = sanitized.replace(/\n\r/g, " ");
		//remove many spaces
		sanitized = sanitized.replace(/\s+/g, " ");
		//add quotes to property names
		sanitized = sanitized.replace(/([\w\d-]+)\s?: ([\w\d\.\)\(,-\s%]+);/g, "\"$1\" : \"$2\",");
		//remove dangling commas
		sanitized = sanitized.replace(/,\s?}/g, " }");
		//remove dangling commas
		sanitized = sanitized.replace(/,$/g, "");
		
		var result = {};
		try {
			result = JSON.parse("{"+sanitized+"}");
		} catch (e) {
			console.error("invalid CSS, could not parse to JSON.", "{"+sanitized+"}");
		}

		return result;

	};

	var applyScrollFrameAnimations = function(element) {

		container = $(element);
		var scrollElements = [];
		container.find("*").each(function(i, node) {
			var scrollAnimationsForNode = checkForScrollAnimations(node);
			if(scrollAnimationsForNode) {
				scrollElements.push(scrollAnimationsForNode);	
			}
		});
		scrollElements = getElementsScrollFrames(scrollElements);
		getNodeFrames(scrollElements);
		applyScrollEventsToContainer(container);
		setupInitialElementState(scrollElements);

	};

	var setupInitialElementState = function (scrollElements) {
		for(var i = 0; i < scrollElements.length; i++) {
			updateScene(scrollElements[i].startFrame);
		}
	};

	var checkForScrollAnimations = function(node) {
		var style_element = window.getComputedStyle(node);
			var property_value = style_element.getPropertyValue('-webkit-animation-name');
			property_value = property_value ? property_value.split(" ") : [];
			for(var i = 0; i < property_value.length; i++) {
				for(var scrollFrameAnimation in scrollFrameDeclarations) {
					if(property_value[i] === scrollFrameAnimation) {
						return {
							node : node,
							scrollAnimation : property_value[i]
						};	
					}
				}
			}
	};

	var applyScrollEventsToContainer = function(container) {
		container.on("touchstart", function() {

			if(scrolling === false) {
				scrolling = true;
				renderLoop();
				//console.log("renderLoop started");
			}

		});

		container.on("touchend", function() {

			scrolling = false;
			//console.log("renderLoop stopped");

		});
	};

	var renderLoop = function() {
		if(scrolling) {
			setTimeout(function() {
				requestAnimFrame(renderLoop);
			}, 10);
		}
		var scrollPos = container.scrollTop();
		updateScene(scrollPos);
	};

	var updateScene = function(scrollPos) {

		var scene = animationFrameData[scrollPos];
		if(scene) {
			
			for(var i = 0; i < scene.length; i++) {
				$(scene[i].node).attr("style", scene[i].style);
			}
		}

	};

	var getElementsScrollFrames = function(animationElements) {
		for(var i = 0; i < animationElements.length; i++) {
			//these frames match the scrollTop result of the scrolled container when the element is about to come on screen and when it leaves
			animationElements[i].endFrame = $(animationElements[i].node).offset().top;
			animationElements[i].startFrame = animationElements[i].endFrame - windowHeight < 0 ? 0 : animationElements[i].endFrame - windowHeight;
		}
		return animationElements;
	};

	var getNodeFrames = function(animationElements) {
		for(var i = 0; i < animationElements.length; i++) {
			
			var frameNumber = animationElements[i].endFrame - animationElements[i].startFrame;
			var currentKeyFrame,
				frameCounter;
			var scrollAnimation = scrollFrameDeclarations[animationElements[i].scrollAnimation]

			for(var keyFrame in scrollAnimation) {
				if(!currentKeyFrame) {
					currentKeyFrame = scrollAnimation[keyFrame];
					frameCounter = animationElements[i].startFrame;
				} else {
					var keyFramePosition = animationElements[i].startFrame + Math.round((frameNumber*(parseInt(keyFrame)/100)));
					addFramesToTimeLine(frameCounter, keyFramePosition, animationElements[i], currentKeyFrame, scrollAnimation[keyFrame]);
					currentKeyFrame = scrollAnimation[keyFrame];
					frameCounter = keyFramePosition;
				}
				
			}

		}
	};

	var addFramesToTimeLine = function(startPosition, endPosition, animationElement, animationFrom, animationTo) {
		var delta = endPosition-startPosition;
		for(var i = startPosition; i <= endPosition; i++) {
			animationFrameData[i] = animationFrameData[i] || [];
			animationFrameData[i].push({
				node : animationElement.node,
				style : getStylesForFrame(animationFrom, animationTo, (i-startPosition)/delta)
			});
		}
	};

	var getStylesForFrame = function(animationFrom, animationTo, frameDelta) {
		var frameStylesData = {};
		var frameStyle = "";
		for(var property in animationFrom) {
			if(animationTo[property]) {
				if(property.indexOf("opacity") !== -1) {
					frameStylesData[property] = getOpacityFrame(animationTo[property], animationFrom[property], frameDelta);
				} else if (property.indexOf("transform") !== -1) {
					frameStylesData[property] = getTransformFrame(animationTo[property], animationFrom[property], frameDelta);
				}
				
			}
		}
		for(var frameStyleComponent in frameStylesData) {
			frameStyle = frameStyle + " " + frameStyleComponent + ":" + frameStylesData[frameStyleComponent] + ";";
		}
		return frameStyle;
	};

	var getOpacityFrame = function(opacityTo, opacityFrom, frameDelta) {
		return (Number(opacityFrom)+((opacityTo-opacityFrom)*frameDelta)).toFixed(3);
	};

	var getTransformFrame = function(transformTo, transformFrom, frameDelta) {

		var transformToData = parseTransformPropertyValue(transformTo);
		var transformFromData = parseTransformPropertyValue(transformFrom);
		var transformStyle = "";
		for(var subProperty in transformFromData) {
			transformStyle = transformStyle + " " + subProperty + "(";
			for(var j = 0; j < transformFromData[subProperty].values.length; j++) {
				var subPropertyValueFrom = Number(transformFromData[subProperty].values[j]);	
				var subPropertyValueTo = Number(transformToData[subProperty].values[j]);
				var step = (subPropertyValueFrom + ((subPropertyValueTo-subPropertyValueFrom)*frameDelta)).toFixed(1);
				transformStyle = transformStyle + step;
				if(j < transformFromData[subProperty].values.length-1) {
					transformStyle = transformStyle + transformFromData[subProperty].units + ",";				
				}
			}
			transformStyle = transformStyle + ")";
		}

		return transformStyle;
	};

	var parseTransformPropertyValue = function(propertyValue) {
		var unparsedValue = propertyValue.replace(/px|%|em/g, ""),
			units,
			propertyValueData = {};

		if(propertyValue.indexOf('px') !== -1) {
			units = "px";
		} else if (propertyValue.indexOf('%')) {
			units = "%";
		} else if (propertyValue.indexOf('em')) {
			units = "em";
		}

		var parsedsubproperty = unparsedValue.split(/(\(|\))/g);
		var subProperty = parsedsubproperty[0];

		propertyValueData[subProperty] = {
			units : units,
			values : parsedsubproperty[2].split(",")
		}
		return propertyValueData;
	};

	init();

	return {
		applyScrollFrameAnimations : applyScrollFrameAnimations
	};
};