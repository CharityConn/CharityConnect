import {Component, h, Prop} from "@stencil/core";

@Component({
	tag: 'loading-spinner',
	styleUrl: 'loading-spinner.css',
	shadow: true,
})
export class LoadingSpinner {

	@Prop()
	color = "#fff";

	@Prop()
	size: "large"|"small"|"inline" = "large";

	render() {
		const color = this.color + " transparent transparent transparent";

		return (
			<div class={"lds-ring " + (this.size !== "large" ? this.size : "")}>
				<div style={{borderColor: color}}></div>
				<div style={{borderColor: color}}></div>
				<div style={{borderColor: color}}></div>
				<div style={{borderColor: color}}></div>
			</div>
		)
	}
}
