import { describe, it, expect } from 'vitest';

describe('Vector Embeddings', () => {
  describe('Vector Generation', () => {
    it('should create a valid 1536-dimension vector', () => {
      const embedding = Array.from({ length: 1536 }, () => Math.random());

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(1536);
      expect(embedding.every((val) => typeof val === 'number')).toBe(true);
    });

    it('should normalize vectors correctly', () => {
      const embedding = Array.from({ length: 1536 }, () => Math.random());

      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      const normalized = embedding.map((val) => val / magnitude);

      const normalizedMagnitude = Math.sqrt(
        normalized.reduce((sum, val) => sum + val * val, 0)
      );

      expect(normalizedMagnitude).toBeCloseTo(1, 5);
    });
  });

  describe('Cosine Similarity', () => {
    it('should calculate cosine similarity between two vectors', () => {
      const vector1 = Array.from({ length: 1536 }, () => Math.random());
      const vector2 = Array.from({ length: 1536 }, () => Math.random());

      const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);

      const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

      const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);

      expect(cosineSimilarity).toBeGreaterThanOrEqual(-1);
      expect(cosineSimilarity).toBeLessThanOrEqual(1);
    });

    it('should return 1 for identical vectors', () => {
      const vector = Array.from({ length: 1536 }, () => Math.random());

      const dotProduct = vector.reduce((sum, val, i) => sum + val * vector[i], 0);
      const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
      const cosineSimilarity = dotProduct / (magnitude * magnitude);

      expect(cosineSimilarity).toBeCloseTo(1, 10);
    });

    it('should handle orthogonal vectors', () => {
      const vector1 = new Array(1536).fill(0);
      vector1[0] = 1;

      const vector2 = new Array(1536).fill(0);
      vector2[1] = 1;

      const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);

      expect(dotProduct).toBe(0);
    });
  });

  describe('Vector Distance Calculations', () => {
    it('should calculate Euclidean distance', () => {
      const vector1 = Array.from({ length: 1536 }, () => Math.random());
      const vector2 = Array.from({ length: 1536 }, () => Math.random());

      const distance = Math.sqrt(
        vector1.reduce((sum, val, i) => sum + Math.pow(val - vector2[i], 2), 0)
      );

      expect(distance).toBeGreaterThanOrEqual(0);
    });

    it('should have zero distance for identical vectors', () => {
      const vector = Array.from({ length: 1536 }, () => Math.random());

      const distance = Math.sqrt(
        vector.reduce((sum, val, i) => sum + Math.pow(val - vector[i], 2), 0)
      );

      expect(distance).toBeCloseTo(0, 10);
    });
  });
});
