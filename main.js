// Filter

Array.prototype.myFilter = function (callback, thisArg) {
  const result = [];
  const length = this.length;

  for (let i = 0; i < length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        result.push(this[i]);
      }
    }
  }

  return result;
};

const nums = [1, 2, 3, 4, 5];

const list = nums.myFilter((n) => n % 2 === 0);
console.log(list);

// MyFind: trả về phần tử đầu tiên thỏa mãn điều kiện, hoặc trả về undefined

Array.prototype.myFind = function (callback, thisArg) {
  const length = this.length;

  for (let i = 0; i < length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        return this[i];
      }
    }
  }

  return undefined;
};

// Mysome: true nếu có ít nhất 1 phần tử thoả điều kiện

Array.prototype.mySome = function (callback, thisArg) {
  const length = this.length;

  for (let i = 0; i < length; i++) {
    if (i in this) {
      if (callback.call(thisArg, this[i], i, this)) {
        return true;
      }
    }
  }

  return false;
};

// forEach: chạy callback cho từng phần tử, KHÔNG trả về gì (luôn undefined)

Array.prototype.myForEach = function (callback, thisArg) {
  const length = this.length;

  for (let i = 0; i < length; i++) {
    if (i in this) {
      callback.call(thisArg, this[i], i, this);
    }
  }
};

// Map: trả về mảng mới với các phần tử được biến đổi bởi callback

Array.prototype.myMap = function (callback, thisArg) {
  const result = [];
  const length = this.length;

  for (let i = 0; i < length; i++) {
    result.push(callback.call(thisArg, this[i], i, this));
  }

  return result;
};

const listNumber = [1, 2, 3, 4, 5];

const list2 = listNumber.myMap((n) => n * 2);
console.log(list2);
