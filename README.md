# scrollFrames
Is a javascript shim designed to reuse existing css standards to create a clean way to make scrolling websites

## What are scrollFrames?

Scrollframes are a way of declaring scrolling animations for elements using the existing css keyframes syntax.

Let's take the following code :

```

.animatedObject {
	
	animation-name : example-animation;
	background-color: #000;
	display: block;

}

@keyframes example-animation {
  
  0% {
    -webkit-transform: translate3d(-50%, 0, 0);
  }

  100% {
    -webkit-transform: translate3d(0%, 0%, 0);
  }
}

```

When the animatedObject class is added to an element, as well as other things it will add the css animation to the element that it is added to. However, what is lacking here is the ability to control the timeline of the animation. All we can do is stop and start the animation, we cannot directly control how far through the animation we are on this element.

## Taking it a step further

A common use case on the internet today is to creating 'scrolling websites', these websites esentially turn the scrollbar into the timeline control of various animation elements, so when you scroll to a certain point, say 250px down the screen, the website responds by positioning various different elements on the screen in specific places. There are other libraries that offer generic ways to do this but none of them reuse any existing syntax pefering to create custom attributes per element to control the animations. With scrollframes the goal was to be able to specify using a CSS property which type of animation should apply when the element scrolls into view and when it leaves. This way you don't have to add custom attributes or specify per element how it should animate you can do so using normal CSS.
Take the example below :

```

.scrollAnimatedObject {
	
	animation-name : scroll-example-animation;
	background-color: #000;
	display: block;

}

@scrollframes scroll-example-animation {
  
  0% {
    -webkit-transform: translate3d(-50%, 0, 0);
  }

  100% {
    -webkit-transform: translate3d(0%, 0%, 0);
  }
}

```

Adding the class "scrollAnimatedObject" to an element, will now cause that element to follow the animation described in the scrollFrames declaration as the page is being scrolled. So when the element comes into view on the page, it's state will be that which is described in the "0%" declaration, as the element scrolls out of view it will transition to the "100%" state, calculating the steps in between to reach that state as it is scrolled.

## Running the example

To run the example, you need nodejs & npm install, then check out this repository and run :

```
npm install
npm start

```

Route your browser to http://localhost:8765/ to see the example.

## Caveats

*You have to specify your scrollFrame css in a separate file, in order that the shim can read it and convert it into JSON to be used by the javascript. Unfortunately there is no way in modern browsers to pull this code directly out of the stylesheets, so until it becomes standard we are stuck with having it in a separate file.


*This only works on webkit browsers, at somepoint I will change this.

*The positioning of your scrollFrame elements matters, the container you specify has to be the thing getting scrolled.

