# tldraw

Welcome to the public monorepo for [tldraw](https://github.com/tldraw/tldraw). tldraw is a library for creating infinite canvas experiences in React. It's the software behind the digital whiteboard [tldraw.com](https://tldraw.com).

- Read the docs and learn more at [tldraw.dev](https://tldraw.dev).
- Learn about [our license](https://github.com/tldraw/tldraw#License).

> 📄 Interested in purchasing a commercial license? Fill out [this form](https://forms.gle/PmS4wNzngnbD3fb89).

## Installation

```bash
npm i tldraw
```

## Usage

```tsx
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw />
		</div>
	)
}
```

Learn more at [tldraw.dev](https://tldraw.dev).

## Local development

The local development server will run our examples app. The basic example will show any changes you've made to the codebase.

To run the local development server, first clone this repo.

Install dependencies:

```bash
yarn
```

Start the local development server:

```bash
yarn dev
```

Open the example project at `localhost:5420`.

## License

tldraw's source code and distributed packages are provided under the non-commercial [tldraw license](https://github.com/tldraw/tldraw/blob/main/LICENSE.md).

This license does not permit commercial use. If you wish to use tldraw in a commercial product or enterprise, you will need to purchase a commercial license.

To obtain a commercial license, please fill out [this form](https://forms.gle/PmS4wNzngnbD3fb89).

To learn more, see our [license](https://tldraw.dev/community/license) page.

## Trademarks

The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](https://github.com/tldraw/tldraw/blob/main/TRADEMARKS.md) for info on acceptable usage.

## Community

Have questions, comments or feedback? [Join our discord](https://discord.gg/rhsyWMUJxd) or [start a discussion](https://github.com/tldraw/tldraw/discussions/new).

## Contribution

Please see our [contributing guide](https://github.com/tldraw/tldraw/blob/main/CONTRIBUTING.md). Found a bug? Please [submit an issue](https://github.com/tldraw/tldraw/issues/new).

## Contributors

<a href="https://github.com/tldraw/tldraw/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=tldraw/tldraw&max=400&columns=20" width="100%"/>
</a>

## Star History

<a href="https://star-history.com/#tldraw/tldraw">
	<picture>
	  <source
	    media="(prefers-color-scheme: dark)"
	    srcset="https://api.star-history.com/svg?repos=tldraw/tldraw&type=Date&theme=dark"
	  />
	  <source
	    media="(prefers-color-scheme: light)"
	    srcset="https://api.star-history.com/svg?repos=tldraw/tldraw&type=Date"
	  />
	  <img src="https://api.star-history.com/svg?repos=tldraw/tldraw&type=Date" alt="Star History Chart" width="100%" />
	</picture>
</a>

## Contact

Find us on Twitter/X at [@tldraw](https://twitter.com/tldraw). You can also [join our discord](https://discord.gg/rhsyWMUJxd) for quick help and support and to connect with the wider tldraw verse.
