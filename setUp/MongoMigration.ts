import fs from 'fs';

type MongoRecord = {
  _id?: { $oid: string };
  emailAddress?: string;
  createdAt?: { $date: string };
salt?: string;
    hash?: string;
  __v?: number;
};

const inputFile = 'users_array.json';
const outputFile = 'users_clean.json';

const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

const cleanedData = data.map((record: MongoRecord) => {
    return {
        id: record._id?.$oid || null,
        emailAddress: record.emailAddress || null,
        salt: record.salt || null,
        hash: record.hash || null,
        createdAt: record.createdAt?.$date || null,
    };
});

fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));

console.log(`✅ Cleaned data written to ${outputFile}`);