import { cn } from "@/lib/utils";
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText as RichTextWithoutBlocks } from "@payloadcms/richtext-lexical/react";

// type NodeTypes = DefaultNodeTypes;
// const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
//   const { value, relationTo } = linkNode.fields.doc!;
//   if (typeof value !== "object") {
//     throw new Error("Expected value to be an object");
//   }
//   const slug = value.slug;
//   return relationTo === "posts" ? `/posts/${slug}` : `/${slug}`;
// };

// const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
//   defaultConverters,
// }) => ({
//   ...defaultConverters,
//   ...LinkJSXConverter({ internalDocToHref }),
//   blocks: {
//     banner: ({ node }) => (
//       <BannerBlock className="col-start-2 mb-4" {...node.fields} />
//     ),
//     mediaBlock: ({ node }) => (
//       <MediaBlock
//         className="col-span-3 col-start-1"
//         imgClassName="m-0"
//         {...node.fields}
//         captionClassName="mx-auto max-w-3xl"
//         enableGutter={false}
//         disableInnerContainer={true}
//       />
//     ),
//     code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
//     cta: ({ node }) => <CallToActionBlock {...node.fields} />,
//   },
// });

type Props = {
  data: SerializedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props;
  return (
    <RichTextWithoutBlocks
      // converters={jsxConverters}
      className={cn(
        {
          container: enableGutter,
          "max-w-none": !enableGutter,
          "prose md:prose-md dark:prose-invert mx-auto": enableProse,
        },
        className,
      )}
      {...rest}
    />
  );
}
