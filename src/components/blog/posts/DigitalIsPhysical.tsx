const Link = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-medium underline underline-offset-2 hover:text-secondary"
  >
    {children}
  </a>
);

export default function Post() {
  return (
    <>
      <div>
        <header className="font-bold text-2xl mt-8">
          Digital is physical.
        </header>
        <p className="text-secondary text-base">01/24/25</p>
      </div>
      <p>
        The best digital interactions more often than not mimic real-world
        interactions, whether or not we realize.{" "}
        <Link href="https://rauno.me/craft/interaction-design">
          Rauno has a great article
        </Link>{" "}
        that dives into this idea in more detail, mostly with touch-devices.
        However, this idea is not restricted to touch-only interactions.
        Computers have their own <Link href="#">handles</Link> too - being the
        mouse and keyboard. The way the user utilizes the mouse and keyboard
        directly follows what they expect the computer interface to do.
      </p>
      <p>
        A lot of this can be boiled down to the concept of{" "}
        <Link href="#">affordances</Link> - a possible action from the relation
        between a user and an object. The simplest example of this is a door
        handle: the handle <i>affords</i> you the ability to open the door with
        your hand. A touch-screen (in most cases) <i>affords</i> you the ability
        to scroll the content with your finger.
      </p>
      <h4 className="font-medium">
        But how does this apply to interaction design on the web, when we only
        have a cursor and keyboard to work with?
      </h4>
      <h3 className="font-medium text-lg mt-4">State of interaction</h3>
      <p>
        We can assume that any element presented to the user is able to be
        interacted with, or not. If it can be interacted with, we must create an
        affordance that conveys that to the user.
      </p>
      <p>
        We can create affordances by utilizing a very popular handle: the
        cursor. Using the cursor is akin to using your eye(s) - you use it to
        look around and gather information about the current environment. The
        cursor is used to infer what can and cannot be interacted with,
        depending on how we treat it. Where are you more inclined to click
        below, just by exploring with the cursor?
      </p>
      <div className="w-full grid grid-cols-2 gap-4 my-2 rounded-lg border border-gray-100 bg-gray-50 overflow-clip">
        <button className="w-full py-4 text-gray-700">Continue</button>
        <button className="w-full py-4 text-gray-700 cursor-pointer">
          Continue
        </button>
      </div>
      <p>
        If you answered the right half, congratulations! You saw that the cursor
        changed when we hovered over it. We achieve this by using{" "}
        <code className="bg-gray-200 rounded-sm text-gray-700 py-0.5 px-1 whitespace-nowrap">
          cursor: pointer
        </code>{" "}
        to transform the cursor into the handy little icon that everybody knows
        as the &quot;click&quot; icon. Helpful!
      </p>
      <p>
        We can make this affordance even clearer by having the environment react
        to the cursor as well. In the updated example below, which half are you
        most likely to click?
      </p>
      <div className="w-full grid grid-cols-2 gap-4 my-2 rounded-lg border border-gray-100 bg-gray-50 overflow-clip">
        <button className="w-full py-4 text-gray-700 cursor-pointer hover:bg-gray-100">
          Continue
        </button>
        <button className="w-full py-4 text-gray-700">Continue</button>
      </div>
      <p>
        You guessed it: the left half. We&apos;ve just made the element interact
        with the cursor without the user even having to click. This is good,
        because that signals to the user that further interaction is possible,
        and even encouraged.
      </p>
      <p>
        We can use these same concepts to convey a <i>lack</i> of affordances to
        the user, letting them know they <i>can&apos;t</i> interact with a
        certain element.
      </p>
      <div className="w-full grid grid-cols-2 gap-4 my-2 rounded-lg border border-gray-100 bg-gray-50 overflow-clip">
        <button className="w-full py-4 text-gray-400 cursor-not-allowed">
          Continue
        </button>
        <button className="w-full py-4 text-gray-700 cursor-pointer hover:bg-gray-100">
          Continue
        </button>
      </div>
      <p>
        Ok, so now we know how we can create affordances with the cursor,
        letting the user know that they can (or cannot) interact with elements.{" "}
        <b className="font-medium">But that&apos;s not very helpful.</b> These
        simple affordances don&apos;t provide any context about <i>how</i> the
        element can be interacted with, nor does it imply what the element
        actually does.
      </p>
      <h3 className="font-medium text-lg mt-4">Motion</h3>
      <p>
        Take a look at the component below, and see if you can guess what it
        does.
      </p>
      <div className="w-full flex items-center justify-center py-4">
        <input
          type="range"
          min={0}
          max={100}
          className="w-2/3 cursor-col-resize"
        />
      </div>
      <p>todo: slider, mimics physical world, make it custom w framer motion</p>
      ... ... ...
      <p>
        Now, this is where it gets a little tricky. How would you expect to
        interact with a knob?
      </p>
      <div className="w-full flex items-center justify-center">
        <div className="size-12 rounded-full bg-gray-500" />
      </div>
      <p>
        You aren&apos;t able to use your whole hand to turn it like you would in
        the real world. You might try to grab the edge of the knob and drag your
        cursor in a circle to turn it, but this is cumbersome and requires more
        precision than is necessary.
      </p>
      <p>
        What does a knob really do? It allows you to select a value from a range
        minimum and maximum. Sliders do this exact same thing.
      </p>
    </>
  );
}
