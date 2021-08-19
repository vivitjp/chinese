export async function getJson(fileName) {
  try {
    if (!fileName) throw new Error('fileName Invalid');
    const res = await fetch(fileName);
    const obj = await res.json();
    if (!res.ok) throw new Error(obj.message); //これ何?
    //console.log(Object.keys(obj).length);
    return obj;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}