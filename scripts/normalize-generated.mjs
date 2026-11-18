import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const generatedFiles = [
  {
    path: 'client/src/api/generated.ts',
    replacements: [
      [/^[ \t]*\/\*\*.*?\*\/[ \t]*\r?\n/gm, ''],
      [/Record<string, any>/g, 'Record<string, unknown>'],
      [/Record<string, unknown> \| undefined/g, 'Record<string, unknown>'],
      [
        /public __meta__\?: Record<string, unknown>;/g,
        'public __meta__: Record<string, unknown> | undefined;',
      ],
      [/(\w+Document) as unknown as string/g, '$1.toString()'],
      [/\| void/g, '| undefined'],
    ],
  },
  {
    path: 'shared/src/generated/graphql.ts',
    replacements: [
      [/^[ \t]*\/\*\*.*?\*\/[ \t]*\r?\n/gm, ''],
      [/SubscriptionSubscribeFn<any,/g, 'SubscriptionSubscribeFn<unknown,'],
      [
        /SubscriptionResolveFn<TResult, any,/g,
        'SubscriptionResolveFn<TResult, unknown,',
      ],
      [/\(\.\.\.args: any\[\]\)/g, '(...args: never[])'],
    ],
  },
];

for (const file of generatedFiles) {
  const filePath = resolve(process.cwd(), file.path);
  let content = await readFile(filePath, 'utf8');
  for (const [pattern, replacement] of file.replacements) {
    content = content.replace(pattern, replacement);
  }
  await writeFile(filePath, content);
}
