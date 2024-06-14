import {TokenScriptsMeta} from "../providers/databaseProvider";

export const knownTokenScripts: TokenScriptsMeta[] = [
	{
		tokenScriptId: "ENS",
		loadType: "resolve",
		name: "ENS",
		iconUrl: "/assets/tokenscript-icons/ENS.png"
	},
	{
		tokenScriptId: "DAI",
		loadType: "resolve",
		name: "DAI",
		iconUrl: "/assets/tokenscript-icons/DAI.png"
	},
];

export const getKnownTokenScriptMetaById = (tsId: string) => {

	for (const meta of knownTokenScripts){
		if (tsId === meta.tokenScriptId)
			return meta;
	}

	return null;
}
