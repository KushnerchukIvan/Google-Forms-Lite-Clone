import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const generatedFiles = [
  {
    path: 'client/src/api/generated.ts',
    replacements: [
      [/^[ \t]*\/\*\*.*?\*\/[ \t]*\r?\n/gm, ''],
      [/Record<string, any>/g, 'Record<string, unknown>'],
      [/(\w+Document) as unknown as string/g, '$1.toString()'],
      [/\| void/g, '| undefined'],
      [
        /public __meta__\?: Record<string, unknown> \| undefined;/g,
        'public __meta__?: Record<string, unknown>;',
      ],
      [
        /(__meta__\?: Record<string, unknown>) \| undefined/g,
        '$1',
      ],
      [
        /this\.__meta__ = __meta__;/g,
        'if (__meta__ !== undefined) this.__meta__ = __meta__;',
      ],
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
