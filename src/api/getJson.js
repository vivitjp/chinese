export async function getJson(fileName) {
  try {
    if (!fileName) throw Error('fileName Invalid');
    const res = await fetch(fileName);
    if (!res) throw Error('Fetch Failed');

    const obj = await res.json();
    if (!res.ok) throw Error(obj.message);
    //console.log(Object.keys(obj).length);
    return obj;

  } catch (error) {
    console.error(fileName, error.message);
    return null;
  }
}