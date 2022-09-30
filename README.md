
This is a library that uses shiki for syntax highlighting. It's intended
for use in markdown/mdx processing, but can also be called directly.

## Why?

Syntax highlighting generates html, so it should really part of the rehype 
stage of processing. But if you wait until that point you lose some metadata.

So what this does is run as both a remark and a rehype plugin. The remark step
just preserves metadata by adding it to the dataSet of the generated code 
element. The rehype step spots these code elements and does the highlighting,
plus any transformation or postprocessing.

In theory we could get to the same place by injecting HTML in the remark plugin,
then unpacking that later with rehype-raw, and postprocessing that. Pick your
poison. 

## Also

There was some other stuff I wanted the highlighter to do. In particular,
I wanted to be able to use the Shiki-generated "scopes" to do some 
postprocessing. So this library adds the scopes to the generated nodes (again
to the dataSet) prior to postprocessing. 

Another thing we do is show/hide certain lines. Shiki is too smart: it won't 
highlight `public` as a modifier here:

<pre>
```ts
public field = 100;
```
</pre>

because `public` only makes sense in a class context. It will highlight this:

<pre>
```ts
class MyClass {
public field = 100;
}
```
</pre>

So if you want the former, the best way to do it is to include the class 
declaration but only render the line you want:

<pre>
```ts show=1
class FakeClass {
public field = 100;
}
```
</pre>

## Update

OK, so there's really no need to use both plugins. Especially since we pass
our own postprocessors to the highlight routine. So I added CombinedPlugin,
which does highlighting as a single pass as a remark plugin. Less elegant, 
maybe, but does the job.


