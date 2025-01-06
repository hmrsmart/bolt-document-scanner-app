export function transform(canvas, corners) {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      const srcCorners = [
        corners[0].x,
        corners[0].y,
        corners[1].x,
        corners[1].y,
        corners[2].x,
        corners[2].y,
        corners[3].x,
        corners[3].y,
      ];

      const dstCorners = [0, 0, 0, height, width, height, width, 0];

      const matrix = getTransformMatrix(srcCorners, dstCorners);

      const transformedCanvas = document.createElement('canvas');
      transformedCanvas.width = width;
      transformedCanvas.height = height;
      const transformedCtx = transformedCanvas.getContext('2d');

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const transformedPoint = applyTransform(matrix, x, y);
          const srcX = Math.round(transformedPoint.x);
          const srcY = Math.round(transformedPoint.y);

          if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
            const pixelData = ctx.getImageData(srcX, srcY, 1, 1).data;
            transformedCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
            transformedCtx.fillRect(x, y, 1, 1);
          }
        }
      }

      return transformedCanvas;
    }

    function getTransformMatrix(srcCorners, dstCorners) {
      const a = [];
      for (let i = 0; i < 4; i++) {
        const x = srcCorners[i * 2];
        const y = srcCorners[i * 2 + 1];
        const dx = dstCorners[i * 2];
        const dy = dstCorners[i * 2 + 1];
        a.push([x, y, 1, 0, 0, 0, -dx * x, -dx * y, dx]);
        a.push([0, 0, 0, x, y, 1, -dy * x, -dy * y, dy]);
      }

      const matrix = solve(a);
      return matrix;
    }

    function applyTransform(matrix, x, y) {
      const transformedX = matrix[0] * x + matrix[1] * y + matrix[2];
      const transformedY = matrix[3] * x + matrix[4] * y + matrix[5];
      const transformedZ = matrix[6] * x + matrix[7] * y + matrix[8];
      return {
        x: transformedX / transformedZ,
        y: transformedY / transformedZ,
      };
    }

    function solve(a) {
      const n = a.length;
      const m = a[0].length;

      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) {
            maxRow = k;
          }
        }
        [a[i], a[maxRow]] = [a[maxRow], a[i]];

        for (let k = i + 1; k < n; k++) {
          const factor = a[k][i] / a[i][i];
          for (let j = i; j < m; j++) {
            a[k][j] -= factor * a[i][j];
          }
        }
      }

      const x = new Array(m - 1).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        x[i] = a[i][m - 1];
        for (let j = i + 1; j < m - 1; j++) {
          x[i] -= a[i][j] * x[j];
        }
        x[i] /= a[i][i];
      }
      return x;
    }
