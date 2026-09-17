---
title: Exploring stereoscopic UI on the web
date: September 17, 2026
---

If you haven't heard of [stereoscopic images](https://stereoscopy.blog/2022/03/11/learning-to-free-view-see-stereoscopic-images-with-the-naked-eye/), it's time you learn about them.

Take a look at the image below. Cross your eyes until you can see 4 images total, and then start slowly uncrossing your eyes until you can combine the inner images into a single center one, and then try to relax your eyes and focus on that middle image. If you've done it correctly, you will feel as though you've unlocked some secret third eye. How does it work?

:::component WebglStereoscopy

First, we need to understand how we as humans are able to see the world around us in 3 dimensions. Put simply, each of our eyes are reading different images of the world around us - their perspectives are a couple inches apart. This difference in perspective seems minimal, but it's enough of a difference for our brain to compare them and deduce how far away something is.

:::component PerspectiveDiagram

Stereoscopic images use this same principle. We take two images with have captured perspectives that are slightly different, put them side by side, and cross our eyes to combine them into one images. Once you're focused on that combined image - it's "3D."

Stereoscopic images unlock something we aren't usually able to see with a 2D screen - depth. Over time, we've been able to create the *illusion* of depth through trends like skeuomorphism, with the use of blur, shadows, borders and more - but it has never unlocked that subconcious perception of 3D space.

Using the technique we learned above, take a look at this modal through your stereoscopic lens. Which part is the closest to you? How many items stick out?

:::component StereoModal
{ "enableSync": false }
:::

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

## But what's the point?

It's pretty obvious that this doesn't have many (if any) realistic use cases in existing software, and will certainly not be the next "trend" in UI. We've been faking depth in UI for decades to achieve the same effect, there's nothing much more to offer in the "real" version of it aside from it being a gimmick. Plus - with stereoscopic UI pairs, you lose 50% of very valuable screen space in the layout simply because it's split-screen.

However, this doesn't mean you shouldn't explore new ideas, or build something cool. 

:::component WebglStereoscopy

^1 You can use this trick for those "Spot the Difference" games. It works quite well.