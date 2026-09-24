---
title: Exploring stereoscopic UI on the web
date: September 17, 2026
---

If you haven't heard of [stereoscopic images](https://stereoscopy.blog/2022/03/11/learning-to-free-view-see-stereoscopic-images-with-the-naked-eye/), you're missing out on a cool little trick our brain can do.

The idea is this - cross your eyes until you can see 4 images total, and then start slowly uncrossing your eyes until you can combine the inner images into a single center one - then try to relax your eyes and focus on that middle image. It might help to use the dots at the top of each image as a reference point. 

:::component CrossEyeDemo

Now, try this strategy on the image below. If you've done it correctly, you will feel as though you've unlocked some secret third eye. 

![a stereoscopic image pair](https://upload.wikimedia.org/wikipedia/commons/1/1b/For_Crosseyed_3D_viewving_DSC05045.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original)
*wikimedia commons*

Cool, isn't it?

Believe it or not, this trick has been around for ages. The stereoscope was introduced to the world in 1838, and iteration on the concept has been happening since then. 3-D movies do this (in a slightly different way) and virtual reality headsets do this (in a different slightly different way). It got me thinking about how I've never really seen a website with this effect.^2 What might stereoscopic pairs have to offer in user interfaces?

## Let's prototype some interfaces

First, we need to understand how we are able to actually see the world around us in 3 dimensions. Put simply, each of our eyes are reading different images of the world around us - their perspectives are a couple inches apart. This difference in perspective seems minimal, but it holds enough information for our brain to deduce how far away everything around us actually is.

Stereoscopic images use this same principle. We take two images with have captured perspectives that are slightly different, put them side by side, and cross our eyes to combine them into one images. Once you're focused on that combined image - it's "3D."

:::component WiggleStereo

Stereoscopic images unlock something we aren't usually able to see with a 2D screen - depth. Over time, we've been able to create the *illusion* of depth through trends like skeuomorphism, with the use of blur, shadows, borders and more - but it has never unlocked that subconcious perception of 3D space.

Using the technique we learned above, take a look at this modal through your stereoscopic lens. Can you see which elements are closer to you than others?

:::component StereoModal
{ "enableSync": false, "showControls": true }
:::

>*Feel free to mess with the eye separation and depth values - you can double click to return to the default to compare.*<

You may have noticed that actually *using* the modal doesn't feel great, and it seems to almost "flicker" on the parts you interact with. This is because we're only affecting one of the two inputs, and it turns out the brain is *really good* at figuring out the difference between them.^1 If we want this experience to be seamless, we must make sure the pointer exists in both of them, and that any effects of interaction are applied to both instances.

:::component StereoModal
{ "enableSync": true, "showControls": true }
:::

How are we achieving this? A couple of things:
- sync engine (must make sure both instances are equal at all times - this includes the user's pointer)
- css perspective skew

This is cool and all, but what might it actually be *useful* for?

Most of our existing flat-design vocabulary is really depth in disguise - the shadows, blurs and scale we use to *fake* a z-axis. There are some UI patterns that rely on depth already - take drag-and-drop for example. What might this look like as a stereoscopic UI pair?

:::component DragReorder
:::

Or nested menus. A submenu is already a small window that floats *above* the one that spawned it - we just fake the "above" with a drop shadow. Made literal, each dropdown you open stacks forward in depth, sitting over its parent instead of beside it.

:::component DropdownMenu
:::

## Let's get fancier

So far we've only applied this effect to flat, 2-dimensional UI. How might something like skeuomorphism enhance this effect?

For starters, having a "real" cursor limits us in this regard. The cursor is always drawn at the topmost layer of the canvas, regardless of the perceived distance of some UI in the stereoscopic examples. This means there could be a button that is *technically* "closer" to the viewer than the cursor, but the cursor will still be drawn on top. Our brains aren't very good at dealing with this, because it's directly conflicting information, and it messes with the effect a little bit.

Instead, we'll use a small translucent black radial-gradient to simulate "focus" on where the user's interaction is. This is much less intrusive and keeps the immersion of the effect a little better.

Skeuomorphism spent a decade *faking* depth — wood grain, bevelled edges, the soft drop shadow under each cover on a shelf rail. Here's the old iOS Newsstand with that faked depth made literal: the wooden rail actually sits in front of the magazines, every cover floats a little off the back wall, and picking one up moves it toward you in space. Hover a cover to lift it off the shelf.

:::component Newsstand
:::

## But what's the point?

It's pretty obvious that this doesn't have many (if any) realistic use cases in existing software, and will certainly not be the next "trend" in UI. We've been faking depth in UI for decades to achieve the same effect, there's nothing much more to offer in the "real" version of it aside from it being a gimmick. Plus - with stereoscopic UI pairs, you lose 50% of very valuable screen space in the layout simply because it's split-screen.

However, not everything needs to have a use. Sometimes, you should explore cool ideas simply because they are cool.

:::component WebglStereoscopy

^1 You can use this trick for those "Spot the Difference" games. It works quite well.

^2 or prove me wrong! I'd love to see one.