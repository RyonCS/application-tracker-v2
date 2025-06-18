"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const inputFile = 'users_array.json';
const outputFile = 'users_clean.json';
const data = JSON.parse(fs_1.default.readFileSync(inputFile, 'utf-8'));
const cleanedData = data.map((record) => {
    return {
        id: record._id?.$oid || null,
        emailAddress: record.emailAddress || null,
        salt: record.salt || null,
        hash: record.hash || null,
        createdAt: record.createdAt?.$date || null,
    };
});
fs_1.default.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));
console.log(`✅ Cleaned data written to ${outputFile}`);
